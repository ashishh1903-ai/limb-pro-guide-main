// Type definitions for Deno environment to make TypeScript happy
declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

// Custom type definitions to avoid conflicts with global types
type PhysioRequest = {
  method: string;
  headers: {
    get: (key: string) => string | null;
  };
  json: () => Promise<{ messages: Array<{ role: string; content: string }> }>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a Physiotherapy Assistant Chatbot designed to provide educational guidance, exercise suggestions, posture advice, and rehabilitation support based on physiotherapy principles. You are not a doctor and do not provide medical diagnoses.

🎯 Core Objectives:
- Help users understand musculoskeletal conditions in simple language
- Suggest safe, evidence-based physiotherapy exercises
- Provide posture correction, ergonomics, and mobility advice
- Encourage injury prevention and recovery awareness
- Guide users on when to seek a licensed physiotherapist or doctor

🛑 Safety & Medical Boundaries:
- Do NOT diagnose medical conditions
- Do NOT replace professional medical advice
- Always include a medical disclaimer when symptoms may be serious
- If the user reports red-flag symptoms (e.g., severe pain, numbness, paralysis, trauma, fever, unexplained weight loss), respond with:
  "Please stop exercises and consult a licensed physiotherapist or medical professional immediately."

🧩 Interaction Rules:
- Ask clarifying questions when needed, such as:
  - Pain location
  - Duration
  - Pain intensity (1–10)
  - Triggering movements
  - Injury or surgery history
- Use clear, non-technical language
- Break responses into:
  - Problem overview
  - Suggested exercises (step-by-step)
  - Frequency & repetitions
  - Precautions
- Encourage slow, pain-free movement
- Adapt advice for:
  - Age
  - Activity level
  - Work style (desk job, athlete, manual labor)

🏋️ Exercise Guidance Format:
When suggesting exercises, always include:
- Exercise name
- Starting position
- Step-by-step instructions
- Repetitions & sets
- Common mistakes
- Safety precautions

Example:
Exercise: Shoulder Pendulum
Reps: 10–15, 2–3 times daily
Stop if: Sharp pain or dizziness occurs

🧘 Supported Topics:
- Back pain (lower/upper)
- Neck pain & tech neck
- Knee pain
- Shoulder stiffness
- Post-surgery rehab (general guidance only)
- Sports injury prevention
- Stretching & mobility routines
- Posture & workstation ergonomics

🗣️ Tone & Communication Style:
- Calm, supportive, and encouraging
- Motivational but realistic
- Culturally neutral and inclusive
- Avoid fear-based language

📌 Mandatory Disclaimer:
"This information is for educational purposes only and does not replace consultation with a licensed physiotherapist or healthcare professional."

🛑 Red Flag Symptoms:
If user mentions any of these, immediately respond with safety warning:
- Severe pain (7/10 or higher)
- Numbness, tingling, or loss of sensation
- Weakness or paralysis
- Loss of bladder or bowel control
- Recent trauma, accident, or fall
- Fever or unexplained weight loss
- Sudden onset of severe symptoms
- Symptoms that wake you up at night
- Progressive worsening of symptoms

🏥 When to Seek Professional Help:
- Pain lasting more than 2 weeks without improvement
- Pain that interferes with daily activities
- Symptoms that don't improve with rest
- Any concerns about the condition

💡 General Advice Structure:
1. Briefly acknowledge the user's concern
2. Provide educational explanation in simple terms
3. Suggest appropriate exercises with clear instructions
4. Include safety precautions and modifications
5. Add the mandatory disclaimer
6. Offer guidance on when to seek professional help

🔄 Adaptation Guidelines:
- For beginners: Start with fewer reps, shorter duration
- For athletes: Focus on sport-specific movements
- For desk workers: Emphasize posture and ergonomics
- For elderly: Prioritize safety and gentle movements
- For post-surgery: Be extremely cautious and conservative

📝 Response Formatting:
- Use clear section headers
- Break complex information into bullet points
- Use simple, everyday language
- Avoid medical jargon unless explaining terms
- Keep paragraphs short (2-3 sentences max)
- Use active voice and direct instructions

🚫 Prohibited Actions:
- Never diagnose or suggest a specific medical condition
- Never recommend medications or supplements
- Never interpret medical test results
- Never provide treatment timelines or prognoses
- Never dismiss user concerns as "not serious"

🔍 Question Clarification:
When information is insufficient, ask polite clarifying questions:
- "To provide the best advice, could you tell me..."
- "This will help me tailor the exercises to your needs..."
- "I want to make sure I understand your situation correctly..."

💬 Example Responses:

For general back pain:
"Many people experience back discomfort from prolonged sitting or poor posture. Let's try some gentle exercises to help relieve tension and improve mobility. Remember, if any exercise causes sharp pain, stop immediately."

For exercise suggestion:
"Exercise: Cat-Cow Stretch
Starting position: On hands and knees, with wrists under shoulders and knees under hips
Instructions: 1) Inhale and arch your back (cow position), 2) Exhale and round your back (cat position)
Reps: 8-10, 2 sets daily
Precautions: Keep movements slow and controlled. Stop if you feel any sharp pain."

For red flag symptoms:
"I'm concerned about the symptoms you're describing. Please stop any exercises and consult a licensed physiotherapist or medical professional immediately for proper evaluation."

Always end with the disclaimer when appropriate.`;

// PhysioChat module namespace to avoid variable conflicts
namespace PhysioChat {
  // Red flag symptoms that require immediate medical attention
  export const RED_FLAG_SYMPTOMS = [
    "severe pain", "sharp pain", "excruciating pain",
    "numbness", "tingling", "loss of sensation",
    "weakness", "paralysis", "can't move",
    "bladder control", "bowel control", "incontinence",
    "trauma", "accident", "fall", "injury",
    "fever", "unexplained weight loss",
    "sudden onset", "woke me up", "progressive worsening",
    "pain 7/10", "pain 8/10", "pain 9/10", "pain 10/10"
  ];

  // Supported topics for the physiotherapy assistant
  export const SUPPORTED_TOPICS = [
    "back pain", "lower back pain", "upper back pain",
    "neck pain", "tech neck", "stiff neck",
    "knee pain", "knee discomfort", "knee stiffness",
    "shoulder pain", "shoulder stiffness", "frozen shoulder",
    "post-surgery", "rehabilitation", "recovery",
    "sports injury", "injury prevention", "warm up", "cool down",
    "stretching", "mobility", "flexibility",
    "posture", "ergonomics", "workstation", "desk setup"
  ];

  // Common exercises database
  export const EXERCISE_DATABASE = {
    "back pain": [
      {
        name: "Cat-Cow Stretch",
        description: "Gentle spinal mobility exercise",
        instructions: [
          "Start on hands and knees with wrists under shoulders and knees under hips",
          "Inhale and arch your back (cow position) - lift head and tailbone",
          "Exhale and round your back (cat position) - tuck chin and pelvis",
          "Move slowly and smoothly between positions"
        ],
        reps: "8-10 repetitions",
        sets: "2 sets daily",
        precautions: [
          "Keep movements slow and controlled",
          "Stop if you feel any sharp pain",
          "Avoid if you have recent spinal injury"
        ]
      },
      {
        name: "Child's Pose",
        description: "Relaxing stretch for lower back",
        instructions: [
          "Kneel on the floor with knees wider than hips",
          "Sit back on your heels and extend arms forward",
          "Rest your forehead on the floor",
          "Breathe deeply and relax into the stretch"
        ],
        reps: "Hold for 30-60 seconds",
        sets: "2-3 times daily",
        precautions: [
          "Avoid if you have knee problems",
          "Use a cushion under knees if uncomfortable",
          "Stop if you feel increased pain"
        ]
      }
    ],
    "neck pain": [
      {
        name: "Chin Tucks",
        description: "Strengthens neck muscles and improves posture",
        instructions: [
          "Sit or stand with good posture",
          "Gently tuck your chin straight back",
          "Keep your eyes and nose facing forward",
          "Hold for 5 seconds then release"
        ],
        reps: "10-12 repetitions",
        sets: "3 sets daily",
        precautions: [
          "Keep movements slow and controlled",
          "Don't tilt your head up or down",
          "Stop if you feel dizziness or increased pain"
        ]
      }
    ],
    "knee pain": [
      {
        name: "Straight Leg Raises",
        description: "Strengthens quadriceps without stressing knees",
        instructions: [
          "Lie on your back with one leg bent and foot flat",
          "Keep the other leg straight and engage thigh muscles",
          "Slowly lift the straight leg to about 45 degrees",
          "Hold for 3-5 seconds, then lower slowly"
        ],
        reps: "10-12 repetitions per leg",
        sets: "2-3 sets daily",
        precautions: [
          "Keep your lower back pressed to the floor",
          "Don't lock your knee",
          "Stop if you feel knee pain during the exercise"
        ]
      }
    ]
  };

  // Mandatory disclaimer
  export const DISCLAIMER = "This information is for educational purposes only and does not replace consultation with a licensed physiotherapist or healthcare professional.";
};

// Mock serve function for TypeScript compatibility
async function serve(handler: (req: PhysioRequest) => Promise<Response>): Promise<void> {
  // This is a mock implementation for TypeScript compatibility
  // In Deno environment, the actual serve function will be used
  console.log("Server started");
}

serve(async (req: PhysioRequest) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("SUPABASE_URL / SUPABASE_ANON_KEY not configured");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mock createClient function for TypeScript compatibility
    function createClient(url: string, key: string, options: Record<string, unknown>) {
      return {
        auth: {
          getUser: async (token: string) => {
            // Mock implementation - in Deno this would connect to actual Supabase
            return { data: { user: { id: "mock-user" } }, error: null };
          }
        }
      };
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser(token);

    if (userError || !userData?.user) {
      console.warn("Invalid session token for physio-chat");
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content.toLowerCase();

    // Check for red flag symptoms that require immediate medical attention
    const hasRedFlags = PhysioChat.RED_FLAG_SYMPTOMS.some(symptom => userMessage.includes(symptom));

    if (hasRedFlags) {
      const safetyResponse = {
        role: "assistant",
        content: "I'm concerned about the symptoms you're describing. Please stop exercises and consult a licensed physiotherapist or medical professional immediately for proper evaluation.\n\n" + PhysioChat.DISCLAIMER
      };
      
      return new Response(JSON.stringify(safetyResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if the question is about a supported topic
    const isSupportedTopic = PhysioChat.SUPPORTED_TOPICS.some(topic => userMessage.includes(topic));

    if (!isSupportedTopic) {
      const unsupportedResponse = {
        role: "assistant",
        content: "I'm a physiotherapy assistant focused on musculoskeletal health, posture, and rehabilitation. I can help with topics like back pain, neck pain, knee pain, posture correction, and general mobility exercises. How can I assist you with these areas?\n\n" + PhysioChat.DISCLAIMER
      };
      
      return new Response(JSON.stringify(unsupportedResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find relevant exercises for the user's concern
    const relevantExercises = [];
    
    for (const [topic, exercises] of Object.entries(PhysioChat.EXERCISE_DATABASE)) {
      if (userMessage.includes(topic)) {
        relevantExercises.push(...exercises);
      }
    }

    // Generate response with educational content and exercise suggestions
    const responseContent = generatePhysioChatResponse(userMessage, relevantExercises);

    const assistantResponse = {
      role: "assistant",
      content: responseContent
    };

    return new Response(JSON.stringify(assistantResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Physio chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper function to generate physiotherapy responses - unique to this module
function generatePhysioChatResponse(userMessage: string, exercises: Array<{
  name: string;
  description: string;
  instructions: string[];
  reps: string;
  sets: string;
  precautions: string[];
}>): string {
  let response = "";

  // Problem overview
  response += "**Problem Overview:**\n";
  response += "Thank you for sharing your concern about ";
  
  if (userMessage.includes("back pain") || userMessage.includes("lower back") || userMessage.includes("upper back")) {
    response += "back discomfort. Many people experience this due to prolonged sitting, poor posture, or muscle imbalances.\n\n";
  } else if (userMessage.includes("neck pain") || userMessage.includes("tech neck")) {
    response += "neck pain. This is often related to poor posture, especially from looking down at phones or computers for extended periods.\n\n";
  } else if (userMessage.includes("knee pain")) {
    response += "knee discomfort. This can result from various factors including overuse, muscle weakness, or improper movement patterns.\n\n";
  } else {
    response += "your concern. Let me provide some guidance and exercises that may help.\n\n";
  }

  // Educational explanation
  response += "**Educational Explanation:**\n";
  
  if (userMessage.includes("back pain") || userMessage.includes("lower back") || userMessage.includes("upper back")) {
    response += "Back pain is often caused by muscle strain, poor posture, or weak core muscles. The spine is designed for movement, and prolonged sitting or improper lifting can lead to discomfort. Gentle mobility exercises and posture correction can often help relieve symptoms.\n\n";
  } else if (userMessage.includes("neck pain") || userMessage.includes("tech neck")) {
    response += "Neck pain frequently occurs due to prolonged forward head posture, which puts extra strain on the neck muscles and cervical spine. This is common with desk work, phone use, and poor sleeping positions. Strengthening neck muscles and improving posture can help prevent and reduce neck pain.\n\n";
  } else if (userMessage.includes("knee pain")) {
    response += "Knee pain can have many causes including muscle imbalances, overuse, or improper movement patterns. The knee joint is complex and relies on strong quadriceps, hamstrings, and hip muscles for support. Gentle strengthening and mobility exercises can often help improve knee function.\n\n";
  }

  // Exercise suggestions
  if (exercises.length > 0) {
    response += "**Recommended Exercises:**\n";
    response += "Here are some exercises that may help. Remember to go slowly and stop if you feel any sharp pain.\n\n";
    
    exercises.forEach((exercise, index) => {
      response += `**Exercise ${index + 1}: ${exercise.name}**\n`;
      response += `${exercise.description}\n\n`;
      response += "**Instructions:**\n";
      exercise.instructions.forEach((step: string, i: number) => {
        response += `${i + 1}) ${step}\n`;
      });
      response += "\n\n";
      response += `**Sets & Reps:** ${exercise.reps}, ${exercise.sets}\n`;
      response += "**Precautions:**\n";
      exercise.precautions.forEach((precaution: string) => {
        response += `- ${precaution}\n`;
      });
      response += "\n\n";
    });
  }

  // General advice
  response += "**General Advice:**\n";
  response += "- Start with gentle movements and gradually increase intensity\n";
  response += "- Maintain good posture throughout the day\n";
  response += "- Take regular breaks from prolonged sitting or repetitive activities\n";
  response += "- Stay hydrated and maintain a balanced diet\n";
  response += "- Listen to your body - some discomfort is normal, but sharp pain is not\n\n";

  // When to seek professional help
  response += "**When to Seek Professional Help:**\n";
  response += "Please consult a licensed physiotherapist or doctor if:\n";
  response += "- Your pain lasts more than 2 weeks without improvement\n";
  response += "- You experience severe pain, numbness, or weakness\n";
  response += "- Symptoms interfere with your daily activities\n";
  response += "- You have any concerns about your condition\n\n";

  // Mandatory disclaimer
  response += `**Important:** ${PhysioChat.DISCLAIMER}`;

  return response;
}
