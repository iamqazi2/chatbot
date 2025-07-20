import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, token } = await request.json();

    if (!url || !token) {
      return NextResponse.json({ error: 'Missing URL or token' }, { status: 400 });
    }

    // Test Jira connection
    const response = await fetch(`${url}/rest/api/2/myself`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const user = await response.json();
      return NextResponse.json({ 
        success: true, 
        user: user.displayName,
        message: 'Jira connection successful' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to connect to Jira' 
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Connection test failed' 
    }, { status: 500 });
  }
}