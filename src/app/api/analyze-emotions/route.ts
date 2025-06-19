import { NextRequest, NextResponse } from 'next/server';

interface EmotionScore {
  name: string;
  score: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const humeApiKey = process.env.HUME_API_KEY;
    if (!humeApiKey) {
      return NextResponse.json(
        { error: 'Hume API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Submit job to Hume API
    const jobFormData = new FormData();
    jobFormData.append('file', audioFile);
    jobFormData.append('json', JSON.stringify({
      models: {
        prosody: {},
        burst: {}
      }
    }));

    const jobResponse = await fetch('https://api.hume.ai/v0/batch/jobs', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': humeApiKey,
      },
      body: jobFormData,
    });

    if (!jobResponse.ok) {
      const errorText = await jobResponse.text();
      console.error('Hume job submission error:', errorText);
      return NextResponse.json(
        { error: 'Failed to submit emotion analysis job' },
        { status: jobResponse.status }
      );
    }

    const jobResult = await jobResponse.json();
    const jobId = jobResult.job_id;

    // Step 2: Poll for job completion
    let jobCompleted = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (!jobCompleted && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}`, {
        headers: {
          'X-Hume-Api-Key': humeApiKey,
        },
      });

      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        if (statusResult.state === 'COMPLETED') {
          jobCompleted = true;
        } else if (statusResult.state === 'FAILED') {
          return NextResponse.json(
            { error: 'Emotion analysis job failed' },
            { status: 500 }
          );
        }
      }
      
      attempts++;
    }

    if (!jobCompleted) {
      return NextResponse.json(
        { error: 'Emotion analysis timed out' },
        { status: 408 }
      );
    }

    // Step 3: Get predictions
    const predictionsResponse = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`, {
      headers: {
        'X-Hume-Api-Key': humeApiKey,
      },
    });

    if (!predictionsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get emotion predictions' },
        { status: predictionsResponse.status }
      );
    }

    const predictions = await predictionsResponse.json();
    
    // Extract emotion scores
    const emotions: EmotionScore[] = [];
    
    if (predictions && predictions.length > 0) {
      const firstResult = predictions[0];
      
      // Combine prosody and burst emotions
      const allEmotions = new Map<string, number>();
      
      // Process prosody emotions
      if (firstResult.results?.predictions?.length > 0) {
        const prosodyPredictions = firstResult.results.predictions[0];
        if (prosodyPredictions.models?.prosody?.grouped_predictions?.length > 0) {
          const prosodyEmotions = prosodyPredictions.models.prosody.grouped_predictions[0].predictions;
          prosodyEmotions.forEach((emotion: any) => {
            allEmotions.set(emotion.name, Math.max(allEmotions.get(emotion.name) || 0, emotion.score));
          });
        }
        
        // Process burst emotions
        if (prosodyPredictions.models?.burst?.grouped_predictions?.length > 0) {
          const burstEmotions = prosodyPredictions.models.burst.grouped_predictions[0].predictions;
          burstEmotions.forEach((emotion: any) => {
            allEmotions.set(emotion.name, Math.max(allEmotions.get(emotion.name) || 0, emotion.score));
          });
        }
      }
      
      // Convert to array and sort by score
      for (const [name, score] of allEmotions.entries()) {
        emotions.push({ name, score });
      }
      
      emotions.sort((a, b) => b.score - a.score);
    }

    return NextResponse.json({
      emotions: emotions.slice(0, 10), // Return top 10 emotions
    });

  } catch (error) {
    console.error('Emotion analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error during emotion analysis' },
      { status: 500 }
    );
  }
}
