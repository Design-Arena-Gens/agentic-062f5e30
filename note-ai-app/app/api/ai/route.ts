import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Use Claude API via Anthropic
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      // Fallback to mock AI response for demo purposes
      const mockResponses = [
        `Based on your request, here are some ideas:\n\n• ${prompt.toLowerCase().includes('brainstorm') ? 'Consider breaking down the problem into smaller components' : 'Expand on the main themes you\'ve outlined'}\n• ${prompt.toLowerCase().includes('improve') ? 'Add more specific examples to illustrate your points' : 'Explore alternative perspectives'}\n• ${prompt.toLowerCase().includes('expand') ? 'Include relevant statistics or data to support your arguments' : 'Consider the implications of your ideas'}`,
        `Here's my analysis:\n\n${context ? 'Building on what you\'ve written, ' : ''}I suggest:\n\n1. Define clear objectives\n2. Research supporting evidence\n3. Develop actionable next steps\n4. Consider potential challenges`,
        `Great thinking! Here are some additions:\n\n✓ ${prompt.includes('?') ? 'To answer your question' : 'Following your thought'}, consider these angles\n✓ This could lead to interesting developments in [related area]\n✓ Don't forget to factor in [relevant consideration]`
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      return NextResponse.json({
        result: randomResponse,
        demo: true
      });
    }

    // Use real Claude API if key is available
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a helpful AI assistant for a note-taking app. The user is working on their notes and needs help with brainstorming and expanding their ideas.

Current note content:
${context || '(empty note)'}

User request:
${prompt}

Please provide helpful, concise suggestions that will be added to their notes. Be creative, insightful, and actionable.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Anthropic API error');
    }

    const data = await response.json();
    const result = data.content[0].text;

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
