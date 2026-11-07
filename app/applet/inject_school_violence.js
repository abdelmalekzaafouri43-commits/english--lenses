const project = {
  id: "proj_school_violence_" + Date.now(),
  userId: "studio_creator",
  title: "SCHOOL VIOLENCE",
  topic: "Bullying & School Safety",
  schoolLevel: "Intermediate (B1)",
  durationMinutes: 3,
  objectives: "Identify forms of school violence, understand the impact of bullying, and learn how to take positive action.",
  vocabulary: "bullying, exclusion, rumors, emotional pain, respect, aggression",
  grammar: "Modals of advice (should), Present Simple for facts",
  lessonContent: `School is a place where students learn, make friends and prepare for their future. However, not every student feels safe at school. School violence can take different forms. It may include bullying, insults, threats, exclusion and physical aggression. Some students laugh at others, spread rumours or make hurtful comments. They may think it is just a joke, but their words can cause real emotional pain. Victims of bullying may feel lonely, frightened and unhappy. They may lose confidence and find it difficult to concentrate in class. But we can all help stop school violence. Students should respect one another, support victims and report bullying to a trusted adult. Teachers and parents should listen, understand and take action. Every student deserves to feel safe, accepted and respected. Remember: Violence is never a solution. Kindness is a strength.`,
  status: "Ready",
  sceneCount: 3,
  scenes: [
    {
      id: "scene_sv_1",
      sceneNumber: 1,
      title: "The Purpose of School",
      visualPrompt: "Bright, welcoming school hallway with students talking and laughing. Floating text: LEARNING, FRIENDS, FUTURE.",
      narration: "School is a place where students learn, make friends and prepare for their future. However, not every student feels safe at school.",
      durationSeconds: 20,
      characterAction: "Avatar stands in a sunlit hallway, gesturing to the environment with a warm smile.",
      cameraAngle: "Wide Shot",
      environment: "Modern School Hallway"
    },
    {
      id: "scene_sv_2",
      sceneNumber: 2,
      title: "Recognizing the Problem",
      visualPrompt: "Environment shifts to cooler tones. Icons appear representing: BULLYING, INSULTS, EXCLUSION. A student looks isolated on a bench.",
      narration: "School violence can take different forms. It may include bullying, insults, threats, exclusion and physical aggression. Words can cause real emotional pain.",
      durationSeconds: 25,
      characterAction: "Avatar looks concerned, pointing to icons that appear in 3D space.",
      cameraAngle: "Medium Shot",
      environment: "School Courtyard"
    },
    {
      id: "scene_sv_3",
      sceneNumber: 3,
      title: "Taking Action Together",
      visualPrompt: "Bright colors return. Students standing together. Large text: RESPECT. SUPPORT. PROTECT. KINDNESS IS STRENGTH.",
      narration: "But we can all help stop school violence. Students should respect one another and support victims. Remember: Violence is never a solution. Kindness is a strength.",
      durationSeconds: 20,
      characterAction: "Avatar makes a heart gesture with hands, then a thumb up.",
      cameraAngle: "Medium Close-Up",
      environment: "Classroom"
    }
  ],
  aiWorksheetData: {
    vocabularyMatching: [
      { term: "Bullying", definition: "Repeated aggressive behavior intended to hurt someone", letter: "A" },
      { term: "Exclusion", definition: "Leaving someone out of a group on purpose", letter: "B" },
      { term: "Aggression", definition: "Hostile or violent behavior", letter: "C" },
      { term: "Kindness", definition: "The quality of being friendly, generous, and considerate", letter: "D" }
    ],
    clozeExercises: [
      { sentence: "Students ________ respect one another to stop violence.", targetWord: "should" },
      { sentence: "Bullying can cause real ________ pain.", targetWord: "emotional" },
      { sentence: "Victims may find it difficult to ________ in class.", targetWord: "concentrate" }
    ],
    readingScenario: {
      title: "The Silent Strength",
      passage: "Leo noticed a group of students laughing at Sarah because of her glasses. He realized this was bullying. Instead of laughing along, Leo went over to Sarah and invited her to join his project group. Later, he told his teacher about the incident. By taking action, Leo helped Sarah feel safe and accepted.",
      criticalThinkingQuestion: "Why was Leo's action an example of kindness being a strength?"
    },
    speakingPrompt: "Discuss with a partner: What are three ways your school can become a safer place for everyone?"
  }
};

async function inject() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/projects/save-to-firebase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: project, userId: "studio_creator" })
    });
    const data = await response.json();
    console.log("Success:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

inject();
