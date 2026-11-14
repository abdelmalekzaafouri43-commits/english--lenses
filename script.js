/**
 * ENGLISH LENSES – PREMIUM AI EDUCATIONAL VIDEO STUDIO
 * Architecture: Modular Vanilla JavaScript (ES6+)
 * Connected to Secure Gemini AI Backend & Firebase Persistence
 */

(function () {
  'use strict';

  // Helper for safe API response parsing
  async function parseApiResponse(response) {
    const text = await response.text();
    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(`Server response error (${response.status}): ${text.substring(0, 100)}`);
    }
    if (!response.ok) {
      throw new Error(result.error || `Request failed with status ${response.status}`);
    }
    return result;
  }

  /* ==========================================================================
     0. API CONFIGURATION
     ========================================================================== */
  const API_CONFIG = {
    get BASE_URL() {
      if (typeof window === 'undefined') return '';
      if (window.ENGLISH_LENSES_API_URL) {
        return window.ENGLISH_LENSES_API_URL;
      }
      if (window.location.protocol === 'file:') {
        return 'http://10.0.2.2:3000';
      }
      return ''; // Same-origin for Vercel, Localhost, and AI Studio Preview
    },
    
    get(path) {
      return this.BASE_URL + path;
    }
  };

  /* ==========================================================================
     1. DEFAULT DATA SEED (Mirrors Android Project & SceneItem Data Models)
     ========================================================================== */
  const INITIAL_DEMO_PROJECTS = [
    {
      id: "demo_project_eep",
      userId: "studio_demo",
      title: "Everyday Idioms: 'Take It or Leave It'",
      topic: "Daily Conversation, Vocabulary & Shadowing",
      schoolLevel: "Intermediate (B1)",
      durationMinutes: 2,
      objectives: "Understand conversational idioms in context, practice listen-and-answer reflexes, and build natural rhythm via shadowing.",
      vocabulary: "take it or leave it, on the fence, sleep on it",
      grammar: "Idiomatic Expressions & Polite Decision Making",
      lessonContent: "Alex and Maya meet at a cozy cafe to discuss a big job offer using everyday English idioms, followed by vocabulary breakdown, speaking pause prompts, and shadowing practice.",
      status: "Ready",
      sceneCount: 4,
      scenes: [
        {
          id: "scene_eep_1",
          sceneNumber: 1,
          sceneType: "listening",
          title: "Part 1: Listening Conversation",
          environment: "Cozy Cafe",
          visualPrompt: "Alex and Maya meet inside a sunlit cafe and talk about a new job offer.",
          narration: "Hey Maya, did you decide about that new job offer? Not yet. They gave me until tomorrow—basically, take it or leave it! I'm still on the fence. You should sleep on it tonight before deciding.",
          dialogue: [
            { speaker: "Alex", side: "left", text: "Hey Maya! Did you decide about that new job offer?" },
            { speaker: "Maya", side: "right", text: "Not yet. They said take it or leave it by tomorrow!" },
            { speaker: "Alex", side: "left", text: "Sounds tough. Are you still on the fence about it?" },
            { speaker: "Maya", side: "right", text: "Yes, I think I'll sleep on it tonight before I decide." }
          ],
          durationSeconds: 18,
          characterAction: "Alex walks in from left, Maya walks in from right; both converse with natural gestures.",
          cameraAngle: "Wide Two-Shot"
        },
        {
          id: "scene_eep_2",
          sceneNumber: 2,
          sceneType: "vocabulary",
          title: "Part 2: Vocabulary Breakdown",
          environment: "Modern Classroom",
          visualPrompt: "Teacher walks beside the interactive vocabulary board to explain key idioms.",
          narration: "Let's break down three useful expressions from the conversation: take it or leave it, on the fence, and sleep on it.",
          vocabCards: [
            {
              word: "Take it or leave it",
              definition: "Accept an offer exactly as it is, or reject it completely.",
              example: "The price is final—you can take it or leave it."
            },
            {
              word: "On the fence",
              definition: "Unable to decide between two choices or options.",
              example: "I'm still on the fence about moving to a new city."
            },
            {
              word: "Sleep on it",
              definition: "Wait until the next day before making an important decision.",
              example: "Don't rush! Sleep on it and tell me tomorrow."
            }
          ],
          durationSeconds: 21,
          characterAction: "Teacher walks toward the board on the left and points to each vocabulary card.",
          cameraAngle: "Medium Shot"
        },
        {
          id: "scene_eep_3",
          sceneNumber: 3,
          sceneType: "speaking",
          title: "Part 3: Listen & Answer Speaking Practice",
          environment: "Modern Classroom",
          visualPrompt: "Teacher steps forward and invites you to answer out loud before the timer ends.",
          narration: "Now it's your turn to speak! When you need extra time before making a big decision, what idiom can you say?",
          pausePrompt: "Say out loud: 'I need to _______ before I decide.'",
          durationSeconds: 14,
          characterAction: "Teacher steps forward to center-left and listens attentively during the countdown.",
          cameraAngle: "Medium Close-Up"
        },
        {
          id: "scene_eep_4",
          sceneNumber: 4,
          sceneType: "shadowing",
          title: "Part 4: Shadowing & Pronunciation",
          environment: "Modern Classroom",
          visualPrompt: "Repeat each highlighted phrase right after the teacher to match natural rhythm.",
          narration: "Listen closely and repeat out loud right after me: I am still on the fence, so I will sleep on it tonight.",
          shadowLine: "I'm still on the fence, so I'll sleep on it tonight.",
          durationSeconds: 14,
          characterAction: "Teacher beats natural rhythm and nods while guiding pronunciation.",
          cameraAngle: "Close-Up"
        }
      ]
    },
    {
      id: "demo_project_sv",
      userId: "studio_demo",
      title: "SCHOOL VIOLENCE: Stop & Protect",
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
          cameraAngle: "Medium Close-up",
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
    },
    {
      id: "demo_project_1",
      userId: "studio_demo",
      title: "Mastering Conditionals in 3D Space",
      topic: "Hypothetical Situations & Second Conditional",
      schoolLevel: "Upper-Intermediate (B2)",
      durationMinutes: 4,
      objectives: "Master the 'if + past simple, would + infinitive' structure using visual sci-fi dilemmas.",
      vocabulary: "hypothetical, time dilation, paradox, alternate reality, dilemma",
      grammar: "Second & Third Conditionals",
      lessonContent: "Students follow Captain Sarah aboard the starship Prometheus making critical decisions under hypothetical dilemmas.",
      status: "Ready",
      sceneCount: 4,
      scenes: [
        {
          id: "scene_1_1",
          sceneNumber: 1,
          title: "Mission Briefing - The Dilemma",
          visualPrompt: "Starship bridge at warp speed with Captain Sarah pointing at anomalous temporal rift",
          narration: "If you had 10 seconds to save your crew or investigate the rift, what would you do?",
          durationSeconds: 18,
          characterAction: "Heroic pose at helm console with urgent gaze",
          cameraAngle: "Medium Shot",
          environment: "Sci-Fi Bridge"
        },
        {
          id: "scene_1_2",
          sceneNumber: 2,
          title: "Grammar Engine - Breaking Down 'If + Would'",
          visualPrompt: "Holographic quantum reactor displaying sentence formulas in glowing cyan lasers",
          narration: "Notice the verb tense: 'If I found a new planet, I would name it Aurora.' Past simple for condition, would for result.",
          durationSeconds: 24,
          characterAction: "Manipulating 3D sentence blocks with pinch gestures",
          cameraAngle: "Medium Close-Up",
          environment: "Holographic Lab"
        },
        {
          id: "scene_1_3",
          sceneNumber: 3,
          title: "Interactive Choice Simulator",
          visualPrompt: "Split holographic screen showing Option A vs Option B with live polling animation",
          narration: "Now complete Sarah's transmission: 'If we had enough fuel, we would return.' Choose your answer!",
          durationSeconds: 20,
          characterAction: "Waiting eagerly with raised eyebrow and interactive buzzer",
          cameraAngle: "Wide Two-Shot",
          environment: "Command Hub"
        },
        {
          id: "scene_1_4",
          sceneNumber: 4,
          title: "Outro & Key Takeaways",
          visualPrompt: "Starship entering hyperspace with neon mission summary badge",
          narration: "Fantastic work pilots! Remember, unreal scenarios always pair with 'would'. See you in the next lesson!",
          durationSeconds: 16,
          characterAction: "Salute and wave as ship jumps to lightspeed",
          cameraAngle: "Close-Up",
          environment: "Deep Cosmos"
        }
      ]
    },
    {
      id: "demo_project_2",
      userId: "studio_demo",
      title: "Job Interview Mastery: Phrasal Verbs",
      topic: "Professional Business English",
      schoolLevel: "Intermediate (B1)",
      durationMinutes: 3,
      objectives: "Confidently incorporate phrasal verbs like 'bring up', 'carry out', and 'follow up' in professional interviews.",
      vocabulary: "bring up, follow up, carry out, take on, wrap up",
      grammar: "Phrasal Verbs with Objects (Separable vs Inseparable)",
      lessonContent: "An interactive interview roleplay set in a modern high-rise tech studio.",
      status: "In Production",
      sceneCount: 3,
      scenes: [
        {
          id: "scene_2_1",
          sceneNumber: 1,
          title: "Entering the Boardroom",
          visualPrompt: "Sleek glass boardroom overlooking London skyline with interviewer smiling",
          narration: "Welcome to the interview studio. Today we master verbs that impress global hiring managers.",
          durationSeconds: 15,
          characterAction: "Firm handshake and sitting at conference table",
          cameraAngle: "Medium Shot",
          environment: "Glass Boardroom"
        },
        {
          id: "scene_2_2",
          sceneNumber: 2,
          title: "Case Study: Leading a Project",
          visualPrompt: "Smartboard popping up with charts: 'We carried out a multi-national audit.'",
          narration: "Instead of saying 'I did the project', say 'I carried out the project' or 'I took on the responsibility'.",
          durationSeconds: 25,
          characterAction: "Presenting metrics with confident hand gestures",
          cameraAngle: "Medium Close-Up",
          environment: "Glass Boardroom"
        },
        {
          id: "scene_2_3",
          sceneNumber: 3,
          title: "Follow-up Strategy",
          visualPrompt: "Digital email animation highlighting polite follow-up template",
          narration: "Always send a note to follow up after the discussion. Practice making your sentence now!",
          durationSeconds: 18,
          characterAction: "Nodding approvingly and reviewing notes",
          cameraAngle: "Close-Up",
          environment: "Office Lounge"
        }
      ]
    }
  ];

  /* ==========================================================================
     2. STUDIO STATE MANAGEMENT
     ========================================================================== */
  const StudioState = {
    projects: [],
    activeProjectId: null,
    activeView: "dashboard",
    projectFilter: "all",
    projectSearchQuery: "",
    video: {
      isPlaying: false,
      sceneIndex: 0,
      elapsedSceneSeconds: 0,
      intervalId: null,
      aspectRatio: "16:9",
      isExporting: false,
      voiceEnabled: true,
      lastSpokenKey: ""
    },
    quiz: {
      items: [],
      userAnswers: {},
      isSubmitted: false
    },

    init() {
      const stored = localStorage.getItem("english_lenses_projects");
      if (stored) {
        try {
          this.projects = JSON.parse(stored);
          // Ensure featured English Easy Practice demo is always up-to-date in projects list
          if (!this.projects.some(p => p.id === "demo_project_eep")) {
            this.projects.unshift(JSON.parse(JSON.stringify(INITIAL_DEMO_PROJECTS[0])));
            this.save();
          }
        } catch (e) {
          console.warn("Failed to parse stored projects, falling back to seed", e);
          this.projects = JSON.parse(JSON.stringify(INITIAL_DEMO_PROJECTS));
        }
      } else {
        this.projects = JSON.parse(JSON.stringify(INITIAL_DEMO_PROJECTS));
        this.save();
      }

      const activeId = localStorage.getItem("english_lenses_active_project");
      const hasShownEepV2 = localStorage.getItem("english_lenses_eep_v2_shown") === "1";
      if (!hasShownEepV2 && this.projects.some(p => p.id === "demo_project_eep")) {
        this.activeProjectId = "demo_project_eep";
        try { localStorage.setItem("english_lenses_eep_v2_shown", "1"); } catch (e) {}
        this.save();
      } else if (activeId && this.projects.some(p => p.id === activeId)) {
        this.activeProjectId = activeId;
      } else if (this.projects.length > 0) {
        this.activeProjectId = this.projects[0].id;
      }
    },

    save() {
      try {
        localStorage.setItem("english_lenses_projects", JSON.stringify(this.projects));
        if (this.activeProjectId) {
          localStorage.setItem("english_lenses_active_project", this.activeProjectId);
        }
      } catch (e) {
        console.error("Storage save error", e);
      }
    },

    getActiveProject() {
      return this.projects.find(p => p.id === this.activeProjectId) || this.projects[0] || null;
    },

    setActiveProject(id) {
      if (this.projects.some(p => p.id === id)) {
        this.activeProjectId = id;
        this.save();
        this.video.sceneIndex = 0;
        this.video.elapsedSceneSeconds = 0;
        this.video.lastSpokenKey = "";
        this.stopVideoPlayback();
        if (typeof VideoCanvasEngine !== 'undefined' && typeof VideoCanvasEngine.resetTransition === 'function') {
          VideoCanvasEngine.resetTransition();
        }
      }
    },

    stopVideoPlayback() {
      if (this.video.intervalId) {
        clearInterval(this.video.intervalId);
        this.video.intervalId = null;
      }
      this.video.isPlaying = false;
      const playBtn = document.getElementById("playPauseBtn");
      if (playBtn) {
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    }
  };

  /* ==========================================================================
     3. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconClass = "fa-info-circle";
    if (type === "success") iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-triangle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4500);
  }

  /* ==========================================================================
     4. NAVIGATION ROUTER
     ========================================================================== */
  const NavigationRouter = {
    init() {
      // Sidebar navigation items
      document.querySelectorAll(".sidebar-nav .nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
          const viewName = btn.dataset.view;
          this.navigateTo(viewName);
          document.getElementById("sidebar").classList.remove("mobile-open");
        });
      });

      // Suite navigation cards & hero action links
      document.addEventListener("click", (e) => {
        const navEl = e.target.closest("[data-navigate]");
        if (navEl) {
          const targetView = navEl.getAttribute("data-navigate");
          this.navigateTo(targetView);
        }
      });

      // Sidebar collapse toggle
      const sidebarToggle = document.getElementById("sidebarToggleBtn");
      if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
          const sidebar = document.getElementById("sidebar");
          sidebar.classList.toggle("collapsed");
          const icon = sidebarToggle.querySelector("i");
          if (sidebar.classList.contains("collapsed")) {
            icon.className = "fa-solid fa-angles-right";
          } else {
            icon.className = "fa-solid fa-angles-left";
          }
        });
      }

      // Mobile Menu Button toggle
      const mobileMenuBtn = document.getElementById("mobileMenuBtn");
      if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => {
          const sidebar = document.getElementById("sidebar");
          sidebar.classList.toggle("mobile-open");
        });
      }

      // Save to Firebase Cloud button in topbar
      const saveCloudBtn = document.getElementById("topbarSaveFirebaseBtn");
      if (saveCloudBtn) {
        saveCloudBtn.addEventListener("click", () => {
          SaveToFirebaseManager.syncActiveProject();
        });
      }
    },

    navigateTo(viewId) {
      StudioState.activeView = viewId;

      document.querySelectorAll(".sidebar-nav .nav-item").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === viewId);
      });

      document.querySelectorAll(".studio-view").forEach(view => {
        view.classList.remove("active");
      });
      const activeSection = document.getElementById(`view-${viewId}`);
      if (activeSection) {
        activeSection.classList.add("active");
      }

      const titleMap = {
        "dashboard": "Dashboard",
        "lesson-generator": "AI Lesson Generator",
        "worksheet-generator": "Printable Worksheet",
        "quiz-generator": "Interactive Quiz",
        "video-studio": "Video Studio & Player",
        "worksheet-analyzer": "AI Worksheet Analyzer",
        "projects": "My Projects"
      };
      const titleEl = document.getElementById("currentViewTitle");
      if (titleEl) {
        titleEl.textContent = titleMap[viewId] || "Studio";
      }

      this.refreshActiveView(viewId);
    },

    refreshActiveView(viewId) {
      if (viewId === "dashboard") {
        DashboardRenderer.render();
      } else if (viewId === "worksheet-generator") {
        WorksheetRenderer.render();
      } else if (viewId === "quiz-generator") {
        QuizRenderer.render();
      } else if (viewId === "video-studio") {
        VideoStudioRenderer.render();
      } else if (viewId === "projects") {
        ProjectsRenderer.render();
      } else if (viewId === "worksheet-analyzer") {
        // No specific initial render needed for analyzer view
      }
      this.updateSidebarActiveCard();
    },

    updateSidebarActiveCard() {
      const activeProj = StudioState.getActiveProject();
      const titleEl = document.getElementById("sidebarActiveProjectTitle");
      const scenesEl = document.getElementById("sidebarActiveProjectScenes");
      if (activeProj && titleEl && scenesEl) {
        titleEl.textContent = activeProj.title;
        scenesEl.textContent = `${activeProj.scenes.length} Scenes • ${activeProj.schoolLevel}`;
      }
    }
  };

  /* ==========================================================================
     5. DASHBOARD VIEW RENDERER
     ========================================================================== */
  const DashboardRenderer = {
    render() {
      const projects = StudioState.projects;
      const totalScenes = projects.reduce((acc, p) => acc + (p.scenes ? p.scenes.length : 0), 0);
      const activeProject = StudioState.getActiveProject();

      const totalProjEl = document.getElementById("metricTotalProjects");
      if (totalProjEl) totalProjEl.textContent = projects.length;

      const totalScenesEl = document.getElementById("metricTotalScenes");
      if (totalScenesEl) totalScenesEl.textContent = totalScenes;

      const activeLevelEl = document.getElementById("metricActiveLevel");
      if (activeLevelEl && activeProject) {
        activeLevelEl.textContent = activeProject.schoolLevel.replace(/\s*\(.*\)/, '');
      }

      const listEl = document.getElementById("dashboardProjectsList");
      if (!listEl) return;
      listEl.innerHTML = "";

      if (projects.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state" style="padding: 30px; text-align: center; color: var(--text-secondary);">
            <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 8px;"></i>
            <p>No curriculum projects yet. Create your first lesson to get started.</p>
          </div>
        `;
        return;
      }

      projects.slice(0, 4).forEach(proj => {
        const card = document.createElement("div");
        card.className = "project-item-card";

        const isCurrent = proj.id === StudioState.activeProjectId;
        card.innerHTML = `
          <div class="project-item-left">
            <div class="project-icon-badge">
              <i class="fa-solid ${isCurrent ? 'fa-clapperboard' : 'fa-film'}"></i>
            </div>
            <div class="project-meta-details">
              <h4>${escapeHtml(proj.title)}</h4>
              <p>${proj.scenes.length} Scenes • ${escapeHtml(proj.schoolLevel)} • ${escapeHtml(proj.topic)}</p>
            </div>
          </div>
          <div class="project-actions">
            <span class="badge ${proj.status === 'Ready' ? 'badge-green' : 'badge-amber'}">${proj.status}</span>
            <button class="btn btn-secondary btn-small open-studio-btn" data-id="${proj.id}">
              <i class="fa-solid fa-play"></i> Open Studio
            </button>
          </div>
        `;

        card.querySelector(".open-studio-btn").addEventListener("click", () => {
          StudioState.setActiveProject(proj.id);
          NavigationRouter.navigateTo("video-studio");
        });

        listEl.appendChild(card);
      });
    }
  };

  /* ==========================================================================
     6. AI LESSON GENERATOR CONTROLLER (Secure Gemini Backend)
     ========================================================================== */
  const LessonGeneratorController = {
    init() {
      const durationInput = document.getElementById("lessonDuration");
      const durationVal = document.getElementById("durationVal");
      if (durationInput && durationVal) {
        durationInput.addEventListener("input", (e) => {
          durationVal.textContent = `${e.target.value} min`;
        });
      }

      const form = document.getElementById("lessonGeneratorForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleGeneration();
        });
      }
    },

    async handleGeneration() {
      const title = document.getElementById("lessonTitle").value.trim();
      const topic = document.getElementById("lessonTopic").value.trim();
      const level = document.getElementById("lessonLevel").value;
      const duration = parseInt(document.getElementById("lessonDuration").value, 10) || 3;
      const grammar = document.getElementById("lessonGrammar").value.trim() || "Sentence Structure & Clarity";
      const vocab = document.getElementById("lessonVocab").value.trim() || "key term, phrase, expression";
      const objectives = document.getElementById("lessonObjectives").value.trim() || "Master conversational confidence and sentence grammar.";
      const notes = document.getElementById("lessonContentNotes").value.trim() || "Structured presentation with 3D visuals.";

      if (!title || !topic) {
        showToast("Please provide both a lesson title and core topic.", "error");
        return;
      }

      const submitBtn = document.getElementById("generateLessonBtn");
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating with Gemini AI...`;

      try {
        const response = await fetch(API_CONFIG.get('/api/ai/generate-lesson'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            topic,
            level,
            durationMinutes: duration,
            grammar,
            vocabulary: vocab,
            objectives,
            contentNotes: notes
          })
        });

        const result = await parseApiResponse(response);

        const generatedData = result.data;
        const generatedScenes = (generatedData.scenes || []).map((s, idx) => ({
          id: "scene_" + Date.now() + "_" + (idx + 1),
          sceneNumber: s.sceneNumber || (idx + 1),
          sceneType: s.sceneType || (["listening", "vocabulary", "speaking", "shadowing"][idx % 4]),
          title: s.title || `Scene ${idx + 1}`,
          visualPrompt: s.visualPrompt || "Virtual classroom staging with floating vocabulary cards",
          narration: s.narration || "Welcome to today's English lesson.",
          dialogue: Array.isArray(s.dialogue) ? s.dialogue : null,
          vocabCards: Array.isArray(s.vocabCards) ? s.vocabCards : null,
          pausePrompt: s.pausePrompt || null,
          shadowLine: s.shadowLine || null,
          durationSeconds: s.durationSeconds || (idx === 1 ? 20 : 16),
          characterAction: s.characterAction || "Engaging eye contact and gestures",
          cameraAngle: s.cameraAngle || "Medium Shot",
          environment: s.environment || (idx === 0 ? "Cozy Cafe" : "Modern Classroom")
        }));

        const newProject = {
          id: "proj_" + Date.now(),
          userId: "studio_creator",
          title: title,
          topic: topic,
          schoolLevel: level,
          durationMinutes: duration,
          objectives: objectives,
          vocabulary: vocab,
          grammar: grammar,
          lessonContent: generatedData.pedagogicalSummary || notes,
          status: "Ready",
          sceneCount: generatedScenes.length,
          scenes: generatedScenes
        };

        StudioState.projects.unshift(newProject);
        StudioState.setActiveProject(newProject.id);
        StudioState.save();

        showToast(`Gemini AI successfully synthesized ${generatedScenes.length} animated scenes!`, "success");

        document.getElementById("lessonGeneratorForm").reset();
        document.getElementById("durationVal").textContent = "3 min";

        NavigationRouter.navigateTo("video-studio");
      } catch (err) {
        console.error('Gemini Lesson Generation error:', err);
        showToast(err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    }
  };

  /* ==========================================================================
     7. PRINTABLE WORKSHEET GENERATOR RENDERER (Gemini AI Backend)
     ========================================================================== */
  const WorksheetRenderer = {
    init() {
      const printBtn = document.getElementById("printWorksheetBtn");
      if (printBtn) {
        printBtn.addEventListener("click", () => {
          window.print();
        });
      }

      const regenBtn = document.getElementById("regenerateWorksheetBtn");
      if (regenBtn) {
        regenBtn.addEventListener("click", () => {
          this.generateWithGemini();
        });
      }

      const readBtn = document.getElementById("generateReadingTextBtn");
      if (readBtn) {
        readBtn.addEventListener("click", () => {
          ReadingGeneratorManager.open();
        });
      }
    },

    async generateWithGemini() {
      const project = StudioState.getActiveProject();
      if (!project) {
        showToast("No active lesson project selected.", "error");
        return;
      }

      const regenBtn = document.getElementById("regenerateWorksheetBtn");
      const originalHtml = regenBtn.innerHTML;
      regenBtn.disabled = true;
      regenBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating with Gemini...`;

      try {
        const response = await fetch(API_CONFIG.get('/api/ai/generate-worksheet'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: project.title,
            topic: project.topic,
            level: project.schoolLevel,
            grammar: project.grammar,
            vocabulary: project.vocabulary,
            lessonContent: project.lessonContent
          })
        });

        const result = await parseApiResponse(response);

        project.aiWorksheetData = result.data;
        StudioState.save();
        this.render();
        showToast("Gemini AI crafted fresh worksheet drills & scenario!", "success");
      } catch (err) {
        console.error('Worksheet error:', err);
        showToast(err.message, "error");
      } finally {
        regenBtn.disabled = false;
        regenBtn.innerHTML = originalHtml;
      }
    },

    render() {
      const container = document.getElementById("worksheetDisplay");
      if (!container) return;

      const project = StudioState.getActiveProject();
      if (!project) {
        container.innerHTML = `<p style="text-align: center; color: #475569;">No active project selected.</p>`;
        return;
      }

      const ws = project.aiWorksheetData;
      const vocabList = ws && ws.vocabularyMatching && ws.vocabularyMatching.length > 0
        ? ws.vocabularyMatching
        : project.vocabulary.split(",").map((v, i) => ({
            term: v.trim(),
            definition: i === 0 ? "A difficult situation requiring a critical choice" : "Core term used in lesson dialogue",
            letter: String.fromCharCode(65 + i)
          })).filter(item => item.term);

      const clozeList = ws && ws.clozeExercises && ws.clozeExercises.length > 0
        ? ws.clozeExercises
        : [
            { sentence: `If the speaker ________ (have) more time, they would review the protocol.`, targetWord: "had" },
            { sentence: `The team ________ (carry out) the task if the parameters were confirmed.`, targetWord: "would carry out" },
            { sentence: `Could you tell me where the session ________ (take place)?`, targetWord: "takes place" }
          ];

      const scenario = ws && ws.readingScenario ? ws.readingScenario : {
        title: project.topic,
        passage: project.lessonContent,
        criticalThinkingQuestion: "How would you solve this scenario using the target grammar structure?"
      };

      const speaking = ws && ws.speakingPrompt ? ws.speakingPrompt : "In pairs, practice role-playing this lesson scenario.";

      container.innerHTML = `
        <div class="worksheet-header">
          <div>
            <h1 class="worksheet-title">${escapeHtml(project.title)}</h1>
            <p class="worksheet-meta">Topic: ${escapeHtml(project.topic)} • Target Level: ${escapeHtml(project.schoolLevel)}</p>
          </div>
          <div style="text-align: right; font-family: sans-serif; font-size: 0.85rem; color: #475569;">
            <p>Student Name: ___________________________</p>
            <p style="margin-top: 6px;">Date: ________________ Class: _________</p>
          </div>
        </div>

        <!-- Section A: Vocabulary Focus -->
        <div class="worksheet-section">
          <h2 class="worksheet-section-title">Part 1: Key Vocabulary Matching</h2>
          <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 12px; font-style: italic;">
            Match each word on the left with its definition on the right.
          </p>
          <div style="display: flex; gap: 40px; margin-bottom: 14px;">
            <div style="flex: 1;">
              ${vocabList.map((item, idx) => `
                <div class="worksheet-exercise-item">
                  <strong>[ &nbsp;&nbsp;&nbsp;&nbsp; ] ${idx + 1}.</strong> ${escapeHtml(item.term)}
                </div>
              `).join("")}
            </div>
            <div style="flex: 1.5; font-size: 0.9rem; line-height: 1.8;">
              ${vocabList.map((item, idx) => `
                <div><strong>${String.fromCharCode(65 + idx)}.</strong> ${escapeHtml(item.definition)}</div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Section B: Grammar in Context -->
        <div class="worksheet-section">
          <h2 class="worksheet-section-title">Part 2: Grammar Cloze Drill (${escapeHtml(project.grammar || 'Target Pattern')})</h2>
          <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 12px; font-style: italic;">
            Fill in each blank with the correct form of the verbs in parentheses according to the grammar rule.
          </p>
          ${clozeList.map((c, idx) => `
            <div class="worksheet-exercise-item">
              ${idx + 1}. ${escapeHtml(c.sentence).replace(/________/g, '<span class="worksheet-blank"></span>')}
            </div>
          `).join("")}
        </div>

        <!-- Section C: Scenario Analysis -->
        <div class="worksheet-section">
          <h2 class="worksheet-section-title">Part 3: Critical Thinking & Dialogue Composition</h2>
          <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 12px; font-style: italic;">
            ${escapeHtml(scenario.criticalThinkingQuestion || 'Analyze the situation below and write your response.')}
          </p>
          <div style="background: #f8fafc; border-left: 4px solid #38bdf8; padding: 12px 16px; margin-bottom: 16px; font-size: 0.92rem; font-style: italic;">
            "${escapeHtml(scenario.passage || project.lessonContent)}"
          </div>
          <p style="font-size: 0.85rem; font-weight: bold; color: #334155; margin-bottom: 8px;">
            Pair Speaking Task: ${escapeHtml(speaking)}
          </p>
          <div style="border-bottom: 1px dotted #94a3b8; height: 28px; margin-bottom: 12px;"></div>
          <div style="border-bottom: 1px dotted #94a3b8; height: 28px; margin-bottom: 12px;"></div>
          <div style="border-bottom: 1px dotted #94a3b8; height: 28px;"></div>
        </div>
      `;
    }
  };

  /* ==========================================================================
     8. INTERACTIVE QUIZ GENERATOR RENDERER (Gemini AI Backend)
     ========================================================================== */
  const QuizRenderer = {
    init() {
      const generateBtn = document.getElementById("generateNewQuizBtn");
      if (generateBtn) {
        generateBtn.addEventListener("click", () => {
          this.generateWithGemini();
        });
      }

      const retryBtn = document.getElementById("retryQuizBtn");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          StudioState.quiz.userAnswers = {};
          StudioState.quiz.isSubmitted = false;
          this.render();
        });
      }
    },

    async generateWithGemini() {
      const project = StudioState.getActiveProject();
      if (!project) return;

      const generateBtn = document.getElementById("generateNewQuizBtn");
      const originalHtml = generateBtn.innerHTML;
      generateBtn.disabled = true;
      generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating with Gemini...`;

      try {
        const response = await fetch(API_CONFIG.get('/api/ai/generate-quiz'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: project.topic,
            grammar: project.grammar,
            vocabulary: project.vocabulary,
            level: project.schoolLevel
          })
        });

        const result = await parseApiResponse(response);

        if (result.data && result.data.questions && result.data.questions.length > 0) {
          StudioState.quiz.items = result.data.questions;
          StudioState.quiz.userAnswers = {};
          StudioState.quiz.isSubmitted = false;
          this.render();
          showToast("Gemini AI generated fresh assessment questions!", "success");
        } else {
          throw new Error("Invalid quiz format returned by AI.");
        }
      } catch (err) {
        console.error('Quiz AI Error:', err);
        showToast(err.message, "error");
      } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalHtml;
      }
    },

    buildDefaultQuestions() {
      const project = StudioState.getActiveProject();
      const grammar = project ? project.grammar : "Conditionals";
      const vocabList = project ? project.vocabulary.split(",").map(v => v.trim()).filter(Boolean) : ["word"];
      const sampleVocab = vocabList[0] || "dilemma";

      StudioState.quiz.items = [
        {
          id: "q1",
          question: `In the sentence: "If she _______ more time, she would join our production team", what is the grammatically correct verb form?`,
          options: ["has", "had", "would have", "will have"],
          correctIndex: 1,
          explanation: `In the second conditional (${escapeHtml(grammar)}), the 'if' clause requires the Past Simple ('had'), while the main clause uses 'would + verb'.`
        },
        {
          id: "q2",
          question: `What is the most accurate synonym for the target vocabulary word "${sampleVocab}" in educational or professional contexts?`,
          options: [
            "A hypothetical problem requiring a balanced choice",
            "A permanent and unchangeable rule",
            "A completely random accident",
            "An effortless routine task"
          ],
          correctIndex: 0,
          explanation: `"${sampleVocab}" refers to an analytical dilemma or hypothetical scenario explored in this lesson module.`
        },
        {
          id: "q3",
          question: `Which option best demonstrates polite, natural professional phrasing?`,
          options: [
            "Give me the answer right now.",
            "I wonder if you could tell me where the presentation is held?",
            "You must answer my email immediately.",
            "Tell the manager I want the report."
          ],
          correctIndex: 1,
          explanation: "Indirect questions with polite opening clauses ('I wonder if you could...') represent high-level CEFR B2 communicative competence."
        }
      ];
      StudioState.quiz.userAnswers = {};
      StudioState.quiz.isSubmitted = false;
    },

    render() {
      if (StudioState.quiz.items.length === 0) {
        this.buildDefaultQuestions();
      }

      const container = document.getElementById("quizDisplay");
      const resultsCard = document.getElementById("quizResultsCard");
      if (!container) return;

      container.innerHTML = "";
      resultsCard.classList.add("hidden");

      StudioState.quiz.items.forEach((item, qIdx) => {
        const card = document.createElement("div");
        card.className = "quiz-card";

        const userAnswer = StudioState.quiz.userAnswers[item.id];
        const isAnswered = userAnswer !== undefined;

        let optionsHtml = "";
        item.options.forEach((opt, optIdx) => {
          let btnClass = "quiz-option-btn";
          if (isAnswered) {
            if (optIdx === item.correctIndex) {
              btnClass += " correct";
            } else if (userAnswer === optIdx && optIdx !== item.correctIndex) {
              btnClass += " incorrect";
            }
          }

          optionsHtml += `
            <button class="${btnClass}" data-qid="${item.id}" data-opt="${optIdx}" ${isAnswered ? "disabled" : ""}>
              <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${escapeHtml(opt)}
            </button>
          `;
        });

        let explanationHtml = "";
        if (isAnswered) {
          explanationHtml = `
            <div class="quiz-explanation">
              <i class="fa-solid fa-lightbulb"></i> <strong>Pedagogical Insight:</strong> ${escapeHtml(item.explanation)}
            </div>
          `;
        }

        card.innerHTML = `
          <div class="quiz-question-text">
            <span>${qIdx + 1}.</span> ${escapeHtml(item.question)}
          </div>
          <div class="quiz-options-list">
            ${optionsHtml}
          </div>
          ${explanationHtml}
        `;

        card.querySelectorAll(".quiz-option-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const qId = btn.dataset.qid;
            const optIndex = parseInt(btn.dataset.opt, 10);
            StudioState.quiz.userAnswers[qId] = optIndex;
            this.checkCompletion();
            this.render();
          });
        });

        container.appendChild(card);
      });
    },

    checkCompletion() {
      const total = StudioState.quiz.items.length;
      const answeredKeys = Object.keys(StudioState.quiz.userAnswers);

      if (answeredKeys.length === total) {
        let correctCount = 0;
        StudioState.quiz.items.forEach(q => {
          if (StudioState.quiz.userAnswers[q.id] === q.correctIndex) {
            correctCount++;
          }
        });

        const resultsCard = document.getElementById("quizResultsCard");
        const scoreText = document.getElementById("quizScoreText");
        if (resultsCard && scoreText) {
          const percentage = Math.round((correctCount / total) * 100);
          scoreText.textContent = `You scored ${correctCount} out of ${total} (${percentage}%)`;
          resultsCard.classList.remove("hidden");
        }
      }
    }
  };

  /* ==========================================================================
     8.5 DYNAMIC VIDEO STAGE CANVAS ENGINE (GSAP Walking Characters & 4-Part ESL)
     ========================================================================== */
  const VideoCanvasEngine = {
    canvas: null,
    ctx: null,
    animId: null,
    particles: [],
    starfield: [],
    lastSceneKey: null,
    lastSceneIdx: -1,
    lastTeacherX: 0.28,
    lastPartnerX: 1.2,
    outgoingCanvas: null,
    outgoingCtx: null,
    incomingCanvas: null,
    incomingCtx: null,
    transition: {
      active: false,
      progress: 1,
      direction: 1
    },
    vocabAnim: {
      lastKey: "",
      offsetX: 0,
      alpha: 1
    },
    stage: {
      camZoom: 1.0,
      camPanX: 0,
      camPanY: 0,
      teacherX: 0.28,
      teacherTargetX: 0.28,
      teacherScale: 1.0,
      teacherFacing: 1,
      partnerX: 1.22,
      partnerTargetX: 1.22,
      partnerScale: 0.97,
      partnerAlpha: 0,
      boardAlpha: 1,
      boardSlideX: 0,
      cardReveal: 1,
      bannerAlpha: 0
    },

    resetTransition() {
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf(this.transition);
        gsap.killTweensOf(this.vocabAnim);
      }
      this.transition.active = false;
      this.transition.progress = 1;
      this.lastSceneKey = null;
      this.lastSceneIdx = -1;
      this.vocabAnim.lastKey = "";
      this.vocabAnim.offsetX = 0;
      this.vocabAnim.alpha = 1;
    },

    ensureTransitionBuffers(w, h) {
      if (typeof document === 'undefined' || !w || !h) return false;
      try {
        if (!this.outgoingCanvas) {
          this.outgoingCanvas = document.createElement('canvas');
          this.outgoingCtx = this.outgoingCanvas.getContext('2d');
        }
        if (!this.incomingCanvas) {
          this.incomingCanvas = document.createElement('canvas');
          this.incomingCtx = this.incomingCanvas.getContext('2d');
        }
        if (!this.outgoingCtx || !this.incomingCtx || typeof this.outgoingCtx.drawImage !== 'function') {
          return false;
        }
        if (this.outgoingCanvas.width !== w || this.outgoingCanvas.height !== h) {
          this.outgoingCanvas.width = w;
          this.outgoingCanvas.height = h;
        }
        if (this.incomingCanvas.width !== w || this.incomingCanvas.height !== h) {
          this.incomingCanvas.width = w;
          this.incomingCanvas.height = h;
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    init() {
      this.canvas = document.getElementById("videoStageCanvas");
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d");

      this.particles = [];
      for (let i = 0; i < 32; i++) {
        this.particles.push({
          x: Math.random() * 960,
          y: Math.random() * 540,
          r: Math.random() * 2.5 + 1,
          speedX: (Math.random() - 0.5) * 0.6,
          speedY: -Math.random() * 0.6 - 0.15,
          alpha: Math.random() * 0.5 + 0.25,
          color: ['#a855f7', '#38bdf8', '#34d399', '#fbbf24'][Math.floor(Math.random() * 4)]
        });
      }

      this.starfield = [];
      for (let i = 0; i < 85; i++) {
        this.starfield.push({
          x: (Math.random() - 0.5) * 960,
          y: (Math.random() - 0.5) * 540,
          z: Math.random() * 960 + 1,
          size: Math.random() * 2 + 1
        });
      }

      this.startLoop();
    },

    setAspectSize(aspectRatio) {
      if (!this.canvas) return;
      if (aspectRatio === "9:16") {
        this.canvas.width = 540;
        this.canvas.height = 960;
      } else {
        this.canvas.width = 960;
        this.canvas.height = 540;
      }
      this.drawFrame();
    },

    getSceneType(scene, idx) {
      if (scene && scene.sceneType) return scene.sceneType;
      const t = ((scene && scene.title) || "").toLowerCase();
      if (t.includes("vocab") || t.includes("grammar") || t.includes("breakdown")) return "vocabulary";
      if (t.includes("speak") || t.includes("answer") || t.includes("challenge") || t.includes("choice")) return "speaking";
      if (t.includes("shadow") || t.includes("repeat") || t.includes("outro")) return "shadowing";
      if (scene && Array.isArray(scene.dialogue) && scene.dialogue.length > 0) return "listening";
      return idx === 0 ? "listening" : (idx === 1 ? "vocabulary" : (idx === 2 ? "speaking" : "shadowing"));
    },

    getPartLabel(sType, idx, scenes, short = false) {
      const hasFourParts = Array.isArray(scenes) && scenes.length >= 4 &&
        this.getSceneType(scenes[0], 0) === "listening" &&
        this.getSceneType(scenes[1], 1) === "vocabulary";
      const partMap = {
        listening: short ? "PART 1 • LISTENING" : "PART 1 • LISTENING PRACTICE",
        vocabulary: short ? "PART 2 • VOCABULARY" : "PART 2 • VOCABULARY BREAKDOWN",
        speaking: short ? "PART 3 • SPEAKING" : "PART 3 • LISTEN & ANSWER",
        shadowing: short ? "PART 4 • SHADOWING" : "PART 4 • SHADOWING PRACTICE"
      };
      const modeMap = {
        listening: short ? `SCENE ${idx + 1} • LISTENING` : "LISTENING PRACTICE",
        vocabulary: short ? `SCENE ${idx + 1} • VOCABULARY` : "VOCABULARY BREAKDOWN",
        speaking: short ? `SCENE ${idx + 1} • SPEAKING` : "LISTEN & ANSWER",
        shadowing: short ? `SCENE ${idx + 1} • SHADOWING` : "SHADOWING PRACTICE"
      };
      if (hasFourParts && partMap[sType]) return partMap[sType];
      return modeMap[sType] || (short ? `SCENE ${idx + 1}` : "INTERACTIVE LESSON");
    },

    onSceneChanged(scene, idx, immediate = false) {
      if (!scene) return;
      const key = `${scene.id || idx}_${idx}`;
      if (this.lastSceneKey === key && !immediate) return;

      const hadPreviousScene = Boolean(this.lastSceneKey);
      const direction = (this.lastSceneIdx !== -1 && idx < this.lastSceneIdx) ? -1 : 1;
      this.lastSceneKey = key;
      this.lastSceneIdx = idx;

      // Capture outgoing frame snapshot & trigger GSAP cross-fade + directional slide
      if (!immediate && hadPreviousScene && typeof gsap !== 'undefined' && this.canvas) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (this.ensureTransitionBuffers(w, h)) {
          try {
            this.outgoingCtx.clearRect(0, 0, w, h);
            this.outgoingCtx.drawImage(this.canvas, 0, 0, w, h);
          } catch (e) {}
        }
        gsap.killTweensOf(this.transition);
        this.transition.active = true;
        this.transition.progress = 0;
        this.transition.direction = direction;
        gsap.to(this.transition, {
          duration: 0.78,
          progress: 1,
          ease: "power3.inOut",
          onComplete: () => {
            this.transition.active = false;
          }
        });
      } else {
        if (typeof gsap !== 'undefined') gsap.killTweensOf(this.transition);
        this.transition.active = false;
        this.transition.progress = 1;
      }

      const sType = this.getSceneType(scene, idx);
      const angle = scene.cameraAngle || 'Medium Shot';
      const isPortrait = this.canvas && this.canvas.height > this.canvas.width;

      let zoom = 1.0;
      let panX = 0;
      let panY = 0;
      if (angle === 'Close-Up') { zoom = 1.24; panY = -18; }
      else if (angle === 'Medium Close-Up') { zoom = 1.14; panY = -10; }
      else if (angle === 'Wide Two-Shot') { zoom = 0.96; panX = 0; }
      else if (angle === 'Over-Shoulder') { zoom = 1.12; panX = 18; }

      let teacherTargetX = isPortrait ? 0.34 : 0.25;
      let teacherScale = 1.0;
      let partnerTargetX = 1.22;
      let partnerAlpha = 0;
      let boardAlpha = 1;

      if (sType === "listening") {
        teacherTargetX = isPortrait ? 0.30 : 0.27;
        partnerTargetX = isPortrait ? 0.72 : 0.73;
        partnerAlpha = 1;
        boardAlpha = 0;
        // Start partner just offstage on first listening cue so she visibly walks in
        if (this.stage.partnerAlpha < 0.05) {
          this.stage.partnerX = 1.16;
        }
      } else if (sType === "vocabulary") {
        teacherTargetX = isPortrait ? 0.28 : 0.22;
        teacherScale = 0.98;
        partnerTargetX = 1.22;
        partnerAlpha = 0;
        boardAlpha = 1;
      } else if (sType === "speaking") {
        teacherTargetX = isPortrait ? 0.36 : 0.32;
        teacherScale = 1.08;
        partnerTargetX = 1.22;
        partnerAlpha = 0;
        boardAlpha = 1;
      } else if (sType === "shadowing") {
        teacherTargetX = isPortrait ? 0.34 : 0.26;
        teacherScale = 1.05;
        partnerTargetX = 1.22;
        partnerAlpha = 0;
        boardAlpha = 1;
      }

      this.stage.teacherTargetX = teacherTargetX;
      this.stage.partnerTargetX = partnerTargetX;

      if (immediate || typeof gsap === 'undefined') {
        this.stage.camZoom = zoom;
        this.stage.camPanX = panX;
        this.stage.camPanY = panY;
        this.stage.teacherX = teacherTargetX;
        this.stage.teacherScale = teacherScale;
        this.stage.partnerX = partnerTargetX;
        this.stage.partnerAlpha = partnerAlpha;
        this.stage.boardAlpha = boardAlpha;
        this.stage.boardSlideX = 0;
        this.stage.cardReveal = 1;
        this.stage.bannerAlpha = 1;
        return;
      }

      gsap.killTweensOf(this.stage);
      this.stage.cardReveal = 0;
      this.stage.boardSlideX = direction * 68;
      this.stage.bannerAlpha = 1;

      gsap.to(this.stage, {
        duration: 1.15,
        ease: "power2.inOut",
        camZoom: zoom,
        camPanX: panX,
        camPanY: panY,
        teacherX: teacherTargetX,
        teacherScale: teacherScale,
        partnerX: partnerTargetX,
        partnerAlpha: partnerAlpha,
        boardAlpha: boardAlpha
      });

      gsap.to(this.stage, {
        duration: 0.78,
        delay: 0.14,
        ease: "power3.out",
        boardSlideX: 0,
        cardReveal: 1
      });

      gsap.to(this.stage, {
        duration: 0.6,
        delay: 2.2,
        ease: "power2.out",
        bannerAlpha: 0
      });
    },

    startLoop() {
      if (this.animId) cancelAnimationFrame(this.animId);
      const render = () => {
        this.drawFrame();
        this.animId = requestAnimationFrame(render);
      };
      this.animId = requestAnimationFrame(render);
    },

    getActiveDialogueTurn(scene, elapsed, duration) {
      if (!scene || !Array.isArray(scene.dialogue) || scene.dialogue.length === 0) return null;
      const lines = scene.dialogue;
      const dur = Math.max(4, duration || 18);
      const perLine = dur / lines.length;
      const idx = Math.min(lines.length - 1, Math.max(0, Math.floor(elapsed / perLine)));
      const lineElapsed = elapsed - idx * perLine;
      return {
        index: idx,
        line: lines[idx],
        progress: Math.min(1, Math.max(0, lineElapsed / perLine))
      };
    },

    drawFrame() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const time = Date.now() / 1000;

      const project = StudioState.getActiveProject();
      const scenes = project ? (project.scenes || []) : [];
      const sceneIdx = StudioState.video.sceneIndex || 0;
      const currentScene = scenes[sceneIdx] || null;
      const sType = this.getSceneType(currentScene, sceneIdx);
      const env = (currentScene && currentScene.environment) ? currentScene.environment : 'Modern Classroom';
      const isPlaying = StudioState.video.isPlaying;
      const elapsed = StudioState.video.elapsedSceneSeconds || 0;
      const duration = currentScene ? (currentScene.durationSeconds || 18) : 18;

      if (currentScene && !this.lastSceneKey) {
        this.onSceneChanged(currentScene, sceneIdx, true);
      }

      const useBufferedTransition =
        this.transition.active &&
        this.transition.progress < 0.999 &&
        this.ensureTransitionBuffers(w, h) &&
        typeof ctx.drawImage === 'function';

      if (useBufferedTransition) {
        const p = Math.min(1, Math.max(0, this.transition.progress));
        const dir = this.transition.direction || 1;
        const slideDist = w * 0.28;

        this.incomingCtx.clearRect(0, 0, w, h);
        this.renderSceneToContext(this.incomingCtx, w, h, time, project, scenes, sceneIdx, currentScene, sType, env, isPlaying, elapsed, duration);

        // Dark studio backdrop prevents seam flashes during cross-dissolve + slide
        ctx.save();
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);

        // Outgoing scene sliding out + fading out
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - p);
        ctx.translate(-dir * slideDist * p, 0);
        ctx.drawImage(this.outgoingCanvas, 0, 0, w, h);
        ctx.restore();

        // Incoming scene sliding in + fading in
        ctx.save();
        ctx.globalAlpha = Math.min(1, p);
        ctx.translate(dir * slideDist * (1 - p), 0);
        ctx.drawImage(this.incomingCanvas, 0, 0, w, h);
        ctx.restore();

        ctx.restore();
        return;
      }

      this.renderSceneToContext(ctx, w, h, time, project, scenes, sceneIdx, currentScene, sType, env, isPlaying, elapsed, duration);
    },

    renderSceneToContext(ctx, w, h, time, project, scenes, sceneIdx, currentScene, sType, env, isPlaying, elapsed, duration) {
      // Fallback slide/fade when offscreen canvas buffers are unavailable (e.g., headless tests)
      const directTransition = this.transition.active && this.transition.progress < 0.999;
      ctx.save();
      if (directTransition) {
        const p = Math.min(1, Math.max(0, this.transition.progress));
        const dir = this.transition.direction || 1;
        ctx.globalAlpha = 0.25 + 0.75 * p;
        ctx.translate(dir * w * 0.16 * (1 - p), 0);
      }

      // 1. Background Environment
      this.drawEnvironment(ctx, w, h, env, time, currentScene, sType);

      // 2. Camera Rig Transform (animated smoothly via GSAP)
      ctx.save();
      const floatY = Math.sin(time * 1.4) * 2;
      const floatX = Math.cos(time * 1.0) * 1.5;

      ctx.translate(w / 2 + this.stage.camPanX + floatX, h / 2 + this.stage.camPanY + floatY);
      ctx.scale(this.stage.camZoom, this.stage.camZoom);
      ctx.translate(-w / 2, -h / 2);

      this.drawParticles(ctx, w, h, time);

      // Determine walking state from delta movement
      const tDelta = Math.abs(this.stage.teacherX - this.lastTeacherX);
      const pDelta = Math.abs(this.stage.partnerX - this.lastPartnerX);
      const teacherWalking = tDelta > 0.0007;
      const partnerWalking = pDelta > 0.0007;
      const teacherDir = (this.stage.teacherX >= this.lastTeacherX) ? 1 : -1;
      const partnerDir = (this.stage.partnerX >= this.lastPartnerX) ? 1 : -1;
      this.lastTeacherX = this.stage.teacherX;
      this.lastPartnerX = this.stage.partnerX;

      // Determine who is currently speaking
      const turn = sType === "listening" ? this.getActiveDialogueTurn(currentScene, elapsed, duration) : null;
      let activeSpeaker = "teacher";
      if (turn && turn.line) {
        activeSpeaker = turn.line.side === "right" ? "partner" : "teacher";
      } else if (sType === "speaking" && elapsed > duration * 0.45) {
        activeSpeaker = "none"; // Teacher pauses to listen to student!
      }

      const teacherSpeaking = isPlaying && activeSpeaker === "teacher";
      const partnerSpeaking = isPlaying && activeSpeaker === "partner";

      // 3. Draw Partner Character (in Listening scenes or walking off-stage)
      if (this.stage.partnerAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = this.stage.partnerAlpha;
        this.drawCharacter(ctx, {
          x: w * this.stage.partnerX,
          y: h * 0.84,
          scale: this.stage.partnerScale * (w < 600 ? 0.78 : 1.0),
          facing: partnerWalking ? partnerDir : -1,
          isWalking: partnerWalking,
          isSpeaking: partnerSpeaking,
          time,
          variant: "partner"
        });
        ctx.restore();
      }

      // 4. Draw Primary Teacher Character (Alex)
      this.drawCharacter(ctx, {
        x: w * this.stage.teacherX,
        y: h * 0.84,
        scale: this.stage.teacherScale * (w < 600 ? 0.78 : 1.0),
        facing: teacherWalking ? teacherDir : 1,
        isWalking: teacherWalking,
        isSpeaking: teacherSpeaking,
        isPointing: (sType === "vocabulary" || sType === "shadowing"),
        time,
        variant: "teacher"
      });

      // 5. Speech Bubble over active character in Listening mode
      if (sType === "listening" && turn && turn.line) {
        const bubbleX = activeSpeaker === "partner" ? w * this.stage.partnerX : w * this.stage.teacherX;
        const bubbleY = h * 0.36;
        this.drawSpeechBubble(ctx, bubbleX, bubbleY, turn.line.speaker, turn.line.text, activeSpeaker === "partner" ? "#34d399" : "#38bdf8", w);
      }

      // 6. Instructional Board / Interactive Cards (with GSAP slide + cross-fade reveal)
      if (this.stage.boardAlpha > 0.05 && sType !== "listening") {
        ctx.save();
        ctx.globalAlpha = this.stage.boardAlpha * Math.max(0, Math.min(1, this.stage.cardReveal));
        ctx.translate(this.stage.boardSlideX || 0, 0);
        if (sType === "vocabulary") {
          this.drawVocabularyBoard(ctx, w, h, time, currentScene, project, elapsed, duration);
        } else if (sType === "speaking") {
          this.drawSpeakingPauseBoard(ctx, w, h, time, currentScene, elapsed, duration, isPlaying);
        } else if (sType === "shadowing") {
          this.drawShadowingBoard(ctx, w, h, time, currentScene, elapsed, duration, isPlaying);
        }
        ctx.restore();
      }

      ctx.restore();

      // 7. HUD Part Banner & Burned-In Karaoke Subtitles (always crisp & exported into WebM!)
      this.drawPartBanner(ctx, w, sType, currentScene, sceneIdx, scenes);
      this.drawBurnedInSubtitles(ctx, w, h, currentScene, sType, turn, elapsed, duration);
      ctx.restore();
    },

    drawEnvironment(ctx, w, h, env, time, currentScene, sType = "listening") {
      if (env.includes('Cafe') || env.includes('Café')) {
        // Cozy Sunlit Cafe
        const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
        wallGrad.addColorStop(0, '#2b1d16');
        wallGrad.addColorStop(0.65, '#432818');
        wallGrad.addColorStop(1, '#1c120d');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, w, h);

        // Warm sunlit window
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(w * 0.34, h * 0.1, w * 0.32, h * 0.34);
        const sunBeam = ctx.createLinearGradient(w * 0.34, h * 0.1, w * 0.66, h * 0.7);
        sunBeam.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
        sunBeam.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
        ctx.fillStyle = sunBeam;
        ctx.fillRect(w * 0.25, h * 0.1, w * 0.5, h * 0.65);

        // Window frame
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 6;
        ctx.strokeRect(w * 0.34, h * 0.1, w * 0.32, h * 0.34);
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.1);
        ctx.lineTo(w * 0.5, h * 0.44);
        ctx.stroke();

        // Hanging warm pendant lights
        [0.2, 0.8].forEach(px => {
          ctx.strokeStyle = '#a8a29e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(w * px, 0);
          ctx.lineTo(w * px, h * 0.14);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(w * px, h * 0.16, 16, Math.PI, 0);
          ctx.fill();

          const glow = ctx.createRadialGradient(w * px, h * 0.18, 4, w * px, h * 0.22, 65);
          glow.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(w * px, h * 0.22, 65, 0, Math.PI * 2);
          ctx.fill();
        });

        // Floor & cafe table
        ctx.fillStyle = '#291a13';
        ctx.fillRect(0, h * 0.78, w, h * 0.22);

        ctx.fillStyle = '#92400e';
        ctx.fillRect(w * 0.43, h * 0.66, w * 0.14, 12);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(w * 0.49, h * 0.66 + 12, 12, h * 0.16);
        // Coffee cups on table
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(w * 0.45, h * 0.66 - 14, 14, 14);
        ctx.fillRect(w * 0.52, h * 0.66 - 14, 14, 14);
      } else if (env.includes('Bridge') || env.includes('Cosmos') || env.includes('Sci-Fi')) {
        const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#ffffff';
        this.starfield.forEach(s => {
          s.z -= (StudioState.video.isPlaying ? 3.5 : 0.7);
          if (s.z <= 0) s.z = 960;
          const k = 400 / s.z;
          const px = s.x * k + w / 2;
          const py = s.y * k + h / 2;
          if (px >= 0 && px <= w && py >= 0 && py <= h) {
            ctx.globalAlpha = (1 - s.z / 960);
            ctx.beginPath();
            ctx.arc(px, py, s.size * (1 - s.z / 960) * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1.0;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w / 2, h + 100, 520, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else if (env.includes('Courtyard') || env.includes('Park')) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.55, '#7dd3fc');
        skyGrad.addColorStop(1, '#bbf7d0');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.beginPath();
        ctx.arc(w * 0.82, h * 0.2, 48, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.72);
        ctx.quadraticCurveTo(w * 0.45, h * 0.65, w, h * 0.74);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, h * 0.78, w, h * 0.22);
      } else if (env.includes('Boardroom') || env.includes('Office')) {
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#0f172a');
        bg.addColorStop(0.65, '#1e293b');
        bg.addColorStop(1, '#090d16');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // City window skyline
        ctx.fillStyle = '#020617';
        ctx.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.45);
        ctx.fillStyle = '#334155';
        for (let b = 0; b < 12; b++) {
          const bw = (w * 0.78) / 12;
          const bh = 60 + ((b * 37) % 110);
          ctx.fillRect(w * 0.11 + b * bw, h * 0.53 - bh, bw - 6, bh);
        }
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h * 0.78, w, h * 0.22);
      } else {
        // Modern Classroom / Hallway with Chalkboard
        const roomGrad = ctx.createLinearGradient(0, 0, 0, h);
        roomGrad.addColorStop(0, '#1e293b');
        roomGrad.addColorStop(0.65, '#334155');
        roomGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = roomGrad;
        ctx.fillRect(0, 0, w, h);

        // Floor
        ctx.fillStyle = '#1e1b18';
        ctx.fillRect(0, h * 0.78, w, h * 0.22);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.78);
        ctx.lineTo(w, h * 0.78);
        ctx.stroke();

        // Classroom Green Chalkboard with Wood Frame
        const boardX = w * 0.12;
        const boardY = h * 0.09;
        const boardW = w * 0.76;
        const boardH = h * 0.42;
        ctx.fillStyle = '#14532d';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 8;
        ctx.fillRect(boardX, boardY, boardW, boardH);
        ctx.strokeRect(boardX, boardY, boardW, boardH);

        if (sType === "listening") {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.font = '600 15px sans-serif';
          ctx.fillText("ENGLISH LENSES • LIVE LESSON", boardX + 24, boardY + 34);
          ctx.font = '500 13px sans-serif';
          ctx.fillStyle = '#fde047';
          const boardTitle = currentScene ? currentScene.title : "Interactive Lesson";
          ctx.fillText(boardTitle.substring(0, 44), boardX + 24, boardY + 60);
        } else {
          // Subtle chalk tray when interactive card sits over right half of board
          ctx.fillStyle = '#78350f';
          ctx.fillRect(boardX + 16, boardY + boardH - 6, boardW - 32, 6);
        }
      }
    },

    drawParticles(ctx, w, h, time) {
      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) p.y = h;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.globalAlpha = p.alpha * (0.55 + 0.45 * Math.sin(time * 2 + p.x));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    },

    drawCharacter(ctx, opts) {
      const { x, y, scale = 1.0, facing = 1, isWalking = false, isSpeaking = false, isPointing = false, time = 0, variant = "teacher" } = opts;
      ctx.save();

      // Shadow under feet
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x, y + 4, 42 * scale, 10 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      const walkCycle = isWalking ? Math.sin(time * 12) : 0;
      const walkBob = isWalking ? Math.abs(Math.sin(time * 12)) * 6 : Math.sin(time * 2.2) * 1.5;

      ctx.translate(x, y - walkBob);
      ctx.scale(scale * facing, scale);

      const isPartner = variant === "partner";
      const suitColor = isPartner ? '#0f766e' : '#1e3a8a';
      const suitStroke = isPartner ? '#2dd4bf' : '#60a5fa';
      const tieColor = isPartner ? '#fbbf24' : '#ef4444';
      const skinColor = isPartner ? '#f3c6a5' : '#fed7aa';
      const hairColor = isPartner ? '#1e293b' : '#5b3a29';

      // Legs & Walking Shoes
      const legStride = isWalking ? walkCycle * 22 : 0;
      const drawLeg = (offsetX, stride) => {
        ctx.save();
        ctx.translate(offsetX, -68);
        ctx.rotate((stride * Math.PI) / 180);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-10, 0, 20, 62);
        // Shoe
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(4, 64, 15, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawLeg(-14, -legStride);
      drawLeg(14, legStride);

      // Back Arm (swings when walking)
      ctx.save();
      ctx.translate(-34, -150);
      ctx.rotate(((isWalking ? legStride * 0.9 : -6) * Math.PI) / 180);
      ctx.strokeStyle = suitColor;
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, 56);
      ctx.stroke();
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(-10, 60, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Torso / Suit Jacket
      ctx.fillStyle = suitColor;
      ctx.strokeStyle = suitStroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-36, -66);
      ctx.quadraticCurveTo(-42, -125, -34, -162);
      ctx.lineTo(34, -162);
      ctx.quadraticCurveTo(42, -125, 36, -66);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shirt & Tie
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-14, -162);
      ctx.lineTo(0, -112);
      ctx.lineTo(14, -162);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = tieColor;
      ctx.beginPath();
      ctx.moveTo(-4, -162);
      ctx.lineTo(4, -162);
      ctx.lineTo(6, -122);
      ctx.lineTo(0, -106);
      ctx.lineTo(-6, -122);
      ctx.closePath();
      ctx.fill();

      // Front Gesturing / Pointing Arm
      ctx.save();
      ctx.translate(34, -150);
      const gestureAngle = isWalking
        ? -legStride * 0.9
        : (isPointing ? -65 + Math.sin(time * 3) * 6 : (isSpeaking ? -42 + Math.sin(time * 6) * 14 : -15));
      ctx.rotate((gestureAngle * Math.PI) / 180);
      ctx.strokeStyle = suitColor;
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14, 54);
      ctx.stroke();
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(15, 58, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Neck & Head
      ctx.fillStyle = skinColor;
      ctx.fillRect(-11, -184, 22, 26);

      ctx.beginPath();
      ctx.ellipse(0, -214, 33, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      if (isPartner) {
        ctx.ellipse(-2, -230, 38, 28, 0, Math.PI * 0.85, Math.PI * 2.15);
        ctx.fill();
        ctx.fillRect(-35, -222, 12, 34);
      } else {
        ctx.ellipse(0, -242, 36, 22, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        // Neat beard for Alex
        ctx.beginPath();
        ctx.arc(0, -206, 30, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fillStyle = '#5b3a29';
        ctx.fill();
      }

      // Eyes & Blink
      const isBlinking = Math.sin(time * 1.4 + (isPartner ? 1.5 : 0)) > 0.95;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-11, -218, 7, isBlinking ? 1 : 5.5, 0, 0, Math.PI * 2);
      ctx.ellipse(13, -218, 7, isBlinking ? 1 : 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!isBlinking) {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-10, -218, 3.5, 0, Math.PI * 2);
        ctx.arc(14, -218, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyebrows
      ctx.strokeStyle = hairColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-18, -228);
      ctx.quadraticCurveTo(-11, -231, -4, -228);
      ctx.moveTo(6, -228);
      ctx.quadraticCurveTo(13, -231, 20, -228);
      ctx.stroke();

      // Mouth (lip-sync when speaking, warm smile when idle)
      if (isSpeaking) {
        const speechH = Math.abs(Math.sin(time * 14)) * 8 + 2.5;
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.ellipse(2, -198, 9, speechH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -202, 12, 3);
      } else {
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(2, -202, 8, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    },

    drawSpeechBubble(ctx, anchorX, anchorY, speaker, text, accentColor, canvasW) {
      ctx.save();
      const maxW = Math.min(340, canvasW * 0.52);
      ctx.font = '600 15px sans-serif';
      const lines = this.wrapText(ctx, text, maxW - 32);
      const boxH = 44 + lines.length * 21;
      const boxX = Math.max(16, Math.min(canvasW - maxW - 16, anchorX - maxW / 2));
      const boxY = Math.max(52, anchorY - boxH);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(boxX, boxY, maxW, boxH, 14);
      } else {
        ctx.rect(boxX, boxY, maxW, boxH);
      }
      ctx.fill();
      ctx.stroke();

      // Tail triangle
      const tipX = Math.max(boxX + 24, Math.min(boxX + maxW - 24, anchorX));
      ctx.beginPath();
      ctx.moveTo(tipX - 10, boxY + boxH - 1);
      ctx.lineTo(tipX, boxY + boxH + 14);
      ctx.lineTo(tipX + 10, boxY + boxH - 1);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = accentColor;
      ctx.font = '800 11px sans-serif';
      ctx.fillText((speaker || 'SPEAKER').toUpperCase(), boxX + 16, boxY + 20);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 15px sans-serif';
      lines.forEach((ln, i) => {
        ctx.fillText(ln, boxX + 16, boxY + 42 + i * 21);
      });
      ctx.restore();
    },

    drawVocabularyBoard(ctx, w, h, time, scene, project, elapsed, duration) {
      const isPortrait = h > w;
      const bx = isPortrait ? w * 0.08 : w * 0.43;
      const by = isPortrait ? h * 0.14 : h * 0.14;
      const bw = isPortrait ? w * 0.84 : w * 0.51;
      const bh = isPortrait ? 270 : 280;

      const cards = (scene && Array.isArray(scene.vocabCards) && scene.vocabCards.length > 0)
        ? scene.vocabCards
        : (project && project.vocabulary
            ? project.vocabulary.split(',').slice(0, 3).map(v => ({
                word: v.trim(),
                definition: "Key expression highlighted in today's lesson.",
                example: scene ? scene.narration : "Use this phrase naturally in conversation."
              }))
            : [{ word: "Key Expression", definition: "Core target vocabulary.", example: "Practice in daily conversation." }]);

      const perCard = Math.max(3, duration / cards.length);
      const cardIdx = Math.min(cards.length - 1, Math.max(0, Math.floor(elapsed / perCard)));
      const card = cards[cardIdx];

      const vocabKey = `${scene ? scene.id : 's'}_${cardIdx}`;
      if (this.vocabAnim.lastKey !== vocabKey) {
        const hadKey = Boolean(this.vocabAnim.lastKey);
        this.vocabAnim.lastKey = vocabKey;
        if (hadKey && typeof gsap !== 'undefined') {
          gsap.killTweensOf(this.vocabAnim);
          this.vocabAnim.offsetX = 36;
          this.vocabAnim.alpha = 0;
          gsap.to(this.vocabAnim, {
            duration: 0.45,
            offsetX: 0,
            alpha: 1,
            ease: "power2.out"
          });
        } else {
          this.vocabAnim.offsetX = 0;
          this.vocabAnim.alpha = 1;
        }
      }

      ctx.save();
      ctx.globalAlpha *= this.vocabAnim.alpha;
      ctx.translate(this.vocabAnim.offsetX, (1 - this.stage.cardReveal) * 20);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.97)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(bx, by, bw, bh, 16);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.stroke();

      // Header pill
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(bx + 18, by + 18, 185, 26);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 12px sans-serif';
      ctx.fillText(`VOCABULARY ${cardIdx + 1} OF ${cards.length}`, bx + 28, by + 35);

      // Word (dynamically sized to prevent overflow)
      const wordText = (card.word || '').toUpperCase();
      let wordFontSize = 24;
      ctx.font = `800 ${wordFontSize}px sans-serif`;
      while (ctx.measureText(wordText).width > bw - 40 && wordFontSize > 16) {
        wordFontSize -= 2;
        ctx.font = `800 ${wordFontSize}px sans-serif`;
      }
      ctx.fillStyle = '#fde047';
      ctx.fillText(wordText, bx + 20, by + 80);

      // Definition
      ctx.fillStyle = '#f8fafc';
      ctx.font = '500 15px sans-serif';
      const defLines = this.wrapText(ctx, card.definition || '', bw - 40);
      defLines.slice(0, 3).forEach((ln, i) => {
        ctx.fillText(ln, bx + 20, by + 114 + i * 22);
      });

      // Example box
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(bx + 18, by + bh - 92, bw - 36, 72, 10);
      else ctx.rect(bx + 18, by + bh - 92, bw - 36, 72);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = '800 11px sans-serif';
      ctx.fillText("EXAMPLE SENTENCE", bx + 30, by + bh - 70);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'italic 14px sans-serif';
      const exLines = this.wrapText(ctx, `"${card.example || ''}"`, bw - 60);
      exLines.slice(0, 2).forEach((ln, i) => {
        ctx.fillText(ln, bx + 30, by + bh - 48 + i * 19);
      });

      ctx.restore();
    },

    drawSpeakingPauseBoard(ctx, w, h, time, scene, elapsed, duration, isPlaying) {
      const isPortrait = h > w;
      const bx = isPortrait ? w * 0.08 : w * 0.46;
      const by = isPortrait ? h * 0.14 : h * 0.15;
      const bw = isPortrait ? w * 0.84 : w * 0.47;
      const bh = 270;

      const pauseStart = duration * 0.45;
      const inPauseWindow = elapsed >= pauseStart;
      const remaining = Math.max(0, Math.ceil(duration - elapsed));
      const pauseProgress = inPauseWindow ? Math.min(1, (elapsed - pauseStart) / Math.max(1, duration - pauseStart)) : 0;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = inPauseWindow ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(bx, by, bw, bh, 16);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = inPauseWindow ? '#34d399' : '#fbbf24';
      ctx.font = '800 13px sans-serif';
      ctx.fillText(inPauseWindow ? "YOUR TURN! SPEAK OUT LOUD" : "LISTEN TO THE QUESTION", bx + 22, by + 34);

      const promptText = (scene && (scene.pausePrompt || scene.narration)) || "Answer the question out loud!";
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 17px sans-serif';
      const lines = this.wrapText(ctx, promptText, bw - 44);
      lines.slice(0, 3).forEach((ln, i) => {
        ctx.fillText(ln, bx + 22, by + 68 + i * 24);
      });

      // Countdown ring
      const cx = bx + bw / 2;
      const cy = by + bh - 68;
      const radius = 38;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = inPauseWindow ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - pauseProgress));
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(inPauseWindow ? `${remaining}s` : (isPlaying ? "..." : "GO"), cx, cy + 8);
      ctx.textAlign = 'left';

      ctx.restore();
    },

    drawShadowingBoard(ctx, w, h, time, scene, elapsed, duration, isPlaying) {
      const isPortrait = h > w;
      const bx = isPortrait ? w * 0.08 : w * 0.43;
      const by = isPortrait ? h * 0.14 : h * 0.15;
      const bw = isPortrait ? w * 0.84 : w * 0.51;
      const bh = 260;

      const sentence = (scene && (scene.shadowLine || scene.narration)) || "Practice speaking clearly with natural rhythm.";
      const words = sentence.split(/\s+/).filter(Boolean);
      const progress = isPlaying ? Math.min(1, elapsed / Math.max(4, duration * 0.65)) : 0;
      const activeWordIdx = Math.floor(progress * words.length);
      const repeatPhase = elapsed > duration * 0.65;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(bx, by, bw, bh, 16);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c4b5fd';
      ctx.font = '800 13px sans-serif';
      ctx.fillText(repeatPhase ? "NOW REPEAT AFTER ME!" : "SHADOWING PRACTICE • LISTEN & REPEAT", bx + 22, by + 36);

      // Word-by-word highlight
      ctx.font = '700 20px sans-serif';
      let curX = bx + 22;
      let curY = by + 84;
      words.forEach((word, i) => {
        const wWidth = ctx.measureText(word + " ").width;
        if (curX + wWidth > bx + bw - 22) {
          curX = bx + 22;
          curY += 32;
        }
        ctx.fillStyle = i <= activeWordIdx ? '#fde047' : '#94a3b8';
        ctx.fillText(word + " ", curX, curY);
        curX += wWidth;
      });

      // Rhythm bar
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.fillRect(bx + 22, by + bh - 38, bw - 44, 10);
      ctx.fillStyle = repeatPhase ? '#34d399' : '#a855f7';
      ctx.fillRect(bx + 22, by + bh - 38, (bw - 44) * Math.min(1, elapsed / Math.max(1, duration)), 10);

      ctx.restore();
    },

    drawPartBanner(ctx, w, sType, scene, sceneIdx = 0, scenes = []) {
      if (this.stage.bannerAlpha <= 0.02) return;
      const text = this.getPartLabel(sType, sceneIdx, scenes, false);
      ctx.save();
      ctx.globalAlpha = this.stage.bannerAlpha;
      ctx.fillStyle = 'rgba(139, 92, 246, 0.94)';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(w / 2 - 165, 14, 330, 30, 15);
      else ctx.rect(w / 2 - 165, 14, 330, 30);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, w / 2, 33);
      ctx.restore();
    },

    drawBurnedInSubtitles(ctx, w, h, scene, sType, turn, elapsed, duration) {
      if (!scene) return;
      let speaker = "TEACHER";
      let speakerColor = "#38bdf8";
      let text = scene.narration || "";
      let progress = Math.min(1, elapsed / Math.max(1, duration));

      if (sType === "listening" && turn && turn.line) {
        speaker = turn.line.speaker || "Speaker";
        speakerColor = turn.line.side === "right" ? "#34d399" : "#38bdf8";
        text = turn.line.text || "";
        progress = turn.progress;
      } else if (sType === "shadowing" && scene.shadowLine) {
        text = scene.shadowLine;
      }

      if (!text) return;

      ctx.save();
      const boxW = w - 48;
      const boxX = 24;
      ctx.font = '700 17px sans-serif';
      const lines = this.wrapText(ctx, `${speaker}: ${text}`, boxW - 36);
      const shownLines = lines.slice(0, 2);
      const boxH = 26 + shownLines.length * 24;
      const boxY = h - boxH - 14;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(boxX, boxY, boxW, boxH, 12);
      else ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();
      ctx.stroke();

      // Draw words with karaoke highlight
      const allWords = text.split(/\s+/).filter(Boolean);
      const highlightedCount = StudioState.video.isPlaying ? Math.ceil(progress * allWords.length) : allWords.length;

      let curX = boxX + 18;
      let curY = boxY + 28;
      ctx.font = '800 15px sans-serif';
      ctx.fillStyle = speakerColor;
      const tag = `${speaker.toUpperCase()}: `;
      ctx.fillText(tag, curX, curY);
      curX += ctx.measureText(tag).width;

      ctx.font = '700 17px sans-serif';
      allWords.forEach((word, i) => {
        const ww = ctx.measureText(word + " ").width;
        if (curX + ww > boxX + boxW - 18) {
          curX = boxX + 18;
          curY += 24;
        }
        if (curY <= boxY + boxH - 8) {
          ctx.fillStyle = i < highlightedCount ? '#fde047' : '#e2e8f0';
          ctx.fillText(word + " ", curX, curY);
        }
        curX += ww;
      });
      ctx.restore();
    },

    wrapText(ctx, text, maxWidth) {
      const words = String(text || '').split(/\s+/);
      const lines = [];
      let current = '';
      words.forEach(w => {
        const test = current ? `${current} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = w;
        } else {
          current = test;
        }
      });
      if (current) lines.push(current);
      return lines;
    }
  };

  /* ==========================================================================
     9. VIDEO STUDIO & STORYBOARD PLAYER
     ========================================================================== */
  const VideoStudioRenderer = {
    init() {
      VideoCanvasEngine.init();

      const playBtn = document.getElementById("playPauseBtn");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          this.togglePlay();
        });
      }

      const prevBtn = document.getElementById("prevSceneBtn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          this.previousScene();
        });
      }

      const nextBtn = document.getElementById("nextSceneBtn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.nextScene();
        });
      }

      const voiceBtn = document.getElementById("voiceToggleBtn");
      if (voiceBtn) {
        voiceBtn.addEventListener("click", () => {
          StudioState.video.voiceEnabled = !StudioState.video.voiceEnabled;
          voiceBtn.classList.toggle("active", StudioState.video.voiceEnabled);
          voiceBtn.innerHTML = StudioState.video.voiceEnabled
            ? `<i class="fa-solid fa-volume-high"></i> Voice ON`
            : `<i class="fa-solid fa-volume-xmark"></i> Voice OFF`;
          if (!StudioState.video.voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
          }
        });
      }

      document.querySelectorAll(".aspect-ratio-controls button").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".aspect-ratio-controls button").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const aspect = btn.dataset.aspect;
          StudioState.video.aspectRatio = aspect;
          const viewport = document.getElementById("videoViewport");
          if (viewport) {
            viewport.className = `video-viewport-wrapper aspect-${aspect.replace(":", "-")}`;
          }
          VideoCanvasEngine.setAspectSize(aspect);
        });
      });

      const addSceneBtn = document.getElementById("addSceneQuickBtn");
      if (addSceneBtn) {
        addSceneBtn.addEventListener("click", () => {
          SceneModalManager.openForAdd();
        });
      }

      const coachBtn = document.getElementById("enhanceScriptAiBtn");
      if (coachBtn) {
        coachBtn.addEventListener("click", () => {
          ScriptCoachManager.open();
        });
      }

      const scrubber = document.getElementById("videoScrubber");
      if (scrubber) {
        scrubber.addEventListener("input", (e) => {
          this.seekToPercent(parseFloat(e.target.value));
        });
      }

      const genVideoBtn = document.getElementById("generateVideoBtn");
      if (genVideoBtn) {
        genVideoBtn.addEventListener("click", () => {
          VideoGeneratorManager.handleGenerate();
        });
      }
    },

    render() {
      const project = StudioState.getActiveProject();
      if (!project) return;

      if (!VideoCanvasEngine.canvas) {
        VideoCanvasEngine.init();
      }

      const scenes = project.scenes || [];
      const currentIdx = Math.min(StudioState.video.sceneIndex, Math.max(0, scenes.length - 1));
      StudioState.video.sceneIndex = currentIdx;

      const currentScene = scenes[currentIdx];
      if (currentScene) {
        VideoCanvasEngine.onSceneChanged(currentScene, currentIdx, false);
      }
      VideoCanvasEngine.drawFrame();

      const sType = VideoCanvasEngine.getSceneType(currentScene, currentIdx);
      const partBadge = document.getElementById("videoPartBadge");
      if (partBadge) {
        partBadge.textContent = VideoCanvasEngine.getPartLabel(sType, currentIdx, scenes, true);
      }

      const sceneBadge = document.getElementById("videoSceneBadge");
      if (sceneBadge) {
        sceneBadge.textContent = scenes.length > 0 ? `Scene ${currentIdx + 1} of ${scenes.length}` : "No Scenes";
      }

      const recBadge = document.getElementById("videoRecBadge");
      if (recBadge) {
        recBadge.innerHTML = StudioState.video.isExporting
          ? `<i class="fa-solid fa-circle" style="color: #ef4444; animation: pulse 1s infinite;"></i> EXPORTING WEBM`
          : (StudioState.video.isPlaying
              ? `<i class="fa-solid fa-circle" style="color: #10b981; animation: pulse 1s infinite;"></i> LIVE 60FPS`
              : `<i class="fa-solid fa-pause"></i> READY 60FPS`);
      }

      const boardTitle = document.getElementById("videoBoardTitle");
      if (boardTitle) {
        boardTitle.textContent = currentScene ? currentScene.title : project.title;
      }

      const subtitles = document.getElementById("videoSubtitles");
      if (subtitles) {
        subtitles.textContent = currentScene ? `"${currentScene.narration}"` : `Ready to direct scenes.`;
      }

      const sceneLabel = document.getElementById("playbackSceneLabel");
      if (sceneLabel) {
        sceneLabel.textContent = currentScene ? `Scene ${currentIdx + 1}: ${currentScene.title}` : "No Scene Active";
      }

      const totalSeconds = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
      const totalTimecode = document.getElementById("totalTimecode");
      if (totalTimecode) {
        totalTimecode.textContent = formatTimecode(totalSeconds);
      }

      this.updateScrubberDisplay();

      const countBadge = document.getElementById("storyboardCountBadge");
      if (countBadge) {
        countBadge.textContent = `${scenes.length} Scenes`;
      }

      const listEl = document.getElementById("storyboardSceneList");
      if (!listEl) return;
      listEl.innerHTML = "";

      scenes.forEach((scene, idx) => {
        const item = document.createElement("div");
        item.className = "storyboard-item";
        if (idx === currentIdx) {
          item.style.borderColor = "var(--accent-purple)";
        }

        const itemType = VideoCanvasEngine.getSceneType(scene, idx);
        item.innerHTML = `
          <div class="scene-header-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="scene-num-badge">SCENE ${scene.sceneNumber || idx + 1}</span>
              <h4 style="font-size: 0.95rem; font-weight: bold; color: #fff;">${escapeHtml(scene.title)}</h4>
            </div>
            <div class="scene-controls-row">
              <span class="badge" style="font-size: 0.72rem;">${escapeHtml(itemType.toUpperCase())}</span>
              <span class="badge" style="font-size: 0.72rem;"><i class="fa-solid fa-video"></i> ${escapeHtml(scene.cameraAngle || 'Medium Shot')}</span>
              <span class="badge badge-purple" style="font-size: 0.72rem;"><i class="fa-solid fa-clock"></i> ${scene.durationSeconds}s</span>
              <button class="btn btn-icon btn-small scene-jump-btn" title="Preview Scene" data-idx="${idx}"><i class="fa-solid fa-play"></i></button>
              <button class="btn btn-icon btn-small scene-up-btn" title="Move Up" data-idx="${idx}" ${idx === 0 ? "disabled" : ""}><i class="fa-solid fa-arrow-up"></i></button>
              <button class="btn btn-icon btn-small scene-down-btn" title="Move Down" data-idx="${idx}" ${idx === scenes.length - 1 ? "disabled" : ""}><i class="fa-solid fa-arrow-down"></i></button>
              <button class="btn btn-icon btn-small scene-edit-btn" title="Edit Scene" data-id="${scene.id}"><i class="fa-solid fa-pen"></i></button>
              <button class="btn btn-icon btn-small scene-dup-btn" title="Duplicate Scene" data-id="${scene.id}"><i class="fa-solid fa-copy"></i></button>
              <button class="btn btn-icon btn-small scene-del-btn" title="Delete Scene" data-id="${scene.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>

          <div class="scene-box-content">
            <div class="scene-box-label"><i class="fa-solid fa-wand-magic-sparkles"></i> Staging (${escapeHtml(scene.environment || 'Modern Classroom')})</div>
            <div class="scene-box-text">${escapeHtml(scene.visualPrompt)}</div>
          </div>

          <div class="scene-box-content" style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2);">
            <div class="scene-box-label" style="color: var(--accent-purple-light);"><i class="fa-solid fa-microphone"></i> Spoken Narration / Dialogue</div>
            <div class="scene-box-text">"${escapeHtml(scene.narration)}"</div>
          </div>
        `;

        item.querySelector(".scene-jump-btn").addEventListener("click", () => {
          StudioState.video.sceneIndex = idx;
          StudioState.video.elapsedSceneSeconds = 0;
          StudioState.video.lastSpokenKey = "";
          this.render();
        });

        item.querySelector(".scene-up-btn").addEventListener("click", () => {
          this.reorderScene(idx, idx - 1);
        });

        item.querySelector(".scene-down-btn").addEventListener("click", () => {
          this.reorderScene(idx, idx + 1);
        });

        item.querySelector(".scene-edit-btn").addEventListener("click", () => {
          SceneModalManager.openForEdit(scene);
        });

        item.querySelector(".scene-dup-btn").addEventListener("click", () => {
          this.duplicateScene(scene.id);
        });

        item.querySelector(".scene-del-btn").addEventListener("click", () => {
          this.deleteScene(scene.id);
        });

        listEl.appendChild(item);
      });
    },

    reorderScene(fromIdx, toIdx) {
      const project = StudioState.getActiveProject();
      if (!project || fromIdx < 0 || toIdx < 0 || toIdx >= project.scenes.length) return;

      const scenes = [...project.scenes];
      const item = scenes.splice(fromIdx, 1)[0];
      scenes.splice(toIdx, 0, item);

      scenes.forEach((s, i) => { s.sceneNumber = i + 1; });
      project.scenes = scenes;
      StudioState.save();
      this.render();
      showToast("Scene order updated", "info");
    },

    duplicateScene(sceneId) {
      const project = StudioState.getActiveProject();
      if (!project) return;
      const target = project.scenes.find(s => s.id === sceneId);
      if (!target) return;

      const copy = JSON.parse(JSON.stringify(target));
      copy.id = "scene_" + Date.now();
      copy.title = `${copy.title} (Copy)`;
      copy.sceneNumber = project.scenes.length + 1;

      project.scenes.push(copy);
      StudioState.save();
      this.render();
      showToast("Scene duplicated successfully", "success");
    },

    deleteScene(sceneId) {
      const project = StudioState.getActiveProject();
      if (!project) return;
      if (project.scenes.length <= 1) {
        showToast("Project must retain at least one scene.", "error");
        return;
      }

      project.scenes = project.scenes.filter(s => s.id !== sceneId);
      project.scenes.forEach((s, i) => { s.sceneNumber = i + 1; });
      if (StudioState.video.sceneIndex >= project.scenes.length) {
        StudioState.video.sceneIndex = Math.max(0, project.scenes.length - 1);
      }
      StudioState.save();
      this.render();
      showToast("Scene removed from storyboard", "info");
    },

    togglePlay() {
      if (StudioState.video.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },

    speakLine(text, pitch = 1.0) {
      if (!StudioState.video.voiceEnabled) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          if (!text) return;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.94;
          utterance.pitch = pitch;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("Speech synthesis unavailable:", e);
        }
      }
    },

    syncSceneAudio(scene, idx, elapsed) {
      if (!scene || !StudioState.video.isPlaying) return;
      const sType = VideoCanvasEngine.getSceneType(scene, idx);
      if (sType === "listening" && Array.isArray(scene.dialogue) && scene.dialogue.length > 0) {
        const turn = VideoCanvasEngine.getActiveDialogueTurn(scene, elapsed, scene.durationSeconds);
        if (turn && turn.line) {
          const key = `dlg_${idx}_${turn.index}`;
          if (StudioState.video.lastSpokenKey !== key) {
            StudioState.video.lastSpokenKey = key;
            const pitch = turn.line.side === "right" ? 1.15 : 0.95;
            this.speakLine(turn.line.text, pitch);
          }
        }
      } else {
        const key = `scene_${idx}`;
        if (StudioState.video.lastSpokenKey !== key) {
          StudioState.video.lastSpokenKey = key;
          this.speakLine(scene.narration, 0.98);
        }
      }
    },

    play() {
      const project = StudioState.getActiveProject();
      if (!project || !project.scenes || project.scenes.length === 0) {
        showToast("No scenes available to play.", "error");
        return;
      }

      StudioState.video.isPlaying = true;
      StudioState.video.lastSpokenKey = "";
      const playBtn = document.getElementById("playPauseBtn");
      if (playBtn) {
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      }

      const currentIdx = StudioState.video.sceneIndex;
      const currentScene = project.scenes[currentIdx];
      const sType = VideoCanvasEngine.getSceneType(currentScene, currentIdx);
      if (StudioState.video.elapsedSceneSeconds < 0.5 && sType === "listening" && typeof gsap !== 'undefined') {
        VideoCanvasEngine.stage.teacherX = 0.08;
        VideoCanvasEngine.stage.partnerX = 0.94;
        gsap.to(VideoCanvasEngine.stage, {
          duration: 1.05,
          ease: "power2.out",
          teacherX: VideoCanvasEngine.stage.teacherTargetX,
          partnerX: VideoCanvasEngine.stage.partnerTargetX
        });
      }
      this.syncSceneAudio(currentScene, currentIdx, StudioState.video.elapsedSceneSeconds);
      this.render();

      if (StudioState.video.intervalId) clearInterval(StudioState.video.intervalId);
      StudioState.video.intervalId = setInterval(() => {
        this.tick();
      }, 250);
    },

    pause() {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      StudioState.stopVideoPlayback();
      this.render();
    },

    tick() {
      const project = StudioState.getActiveProject();
      if (!project || !project.scenes || project.scenes.length === 0) {
        this.pause();
        return;
      }

      const scenes = project.scenes;
      let currentIdx = StudioState.video.sceneIndex;
      let currentScene = scenes[currentIdx];

      StudioState.video.elapsedSceneSeconds += 0.25;

      if (StudioState.video.elapsedSceneSeconds >= currentScene.durationSeconds) {
        if (currentIdx + 1 < scenes.length) {
          StudioState.video.sceneIndex++;
          StudioState.video.elapsedSceneSeconds = 0;
          StudioState.video.lastSpokenKey = "";
          const nextIdx = StudioState.video.sceneIndex;
          this.syncSceneAudio(scenes[nextIdx], nextIdx, 0);
          if (typeof VideoGeneratorManager.playChime === 'function' && StudioState.video.isExporting) {
            VideoGeneratorManager.playChime(660);
          }
          this.render();
        } else {
          StudioState.video.sceneIndex = 0;
          StudioState.video.elapsedSceneSeconds = 0;
          StudioState.video.lastSpokenKey = "";
          this.pause();
          showToast("Storyboard video playback complete!", "success");
        }
      } else {
        this.syncSceneAudio(currentScene, currentIdx, StudioState.video.elapsedSceneSeconds);
        this.updateScrubberDisplay();
      }
    },

    updateScrubberDisplay() {
      const project = StudioState.getActiveProject();
      if (!project || !project.scenes || project.scenes.length === 0) return;

      const scenes = project.scenes;
      let elapsedTotal = 0;
      for (let i = 0; i < StudioState.video.sceneIndex; i++) {
        elapsedTotal += scenes[i].durationSeconds;
      }
      elapsedTotal += StudioState.video.elapsedSceneSeconds;

      const totalDuration = scenes.reduce((a, b) => a + b.durationSeconds, 0);
      const currentTimecode = document.getElementById("currentTimecode");
      if (currentTimecode) {
        currentTimecode.textContent = formatTimecode(Math.floor(elapsedTotal));
      }

      const scrubber = document.getElementById("videoScrubber");
      if (scrubber && totalDuration > 0) {
        const percent = Math.min(100, (elapsedTotal / totalDuration) * 100);
        scrubber.value = percent;
      }
    },

    seekToPercent(percent) {
      const project = StudioState.getActiveProject();
      if (!project || !project.scenes) return;

      const totalDuration = project.scenes.reduce((a, b) => a + b.durationSeconds, 0);
      const targetSec = (percent / 100) * totalDuration;

      let accumulated = 0;
      for (let i = 0; i < project.scenes.length; i++) {
        const dur = project.scenes[i].durationSeconds;
        if (accumulated + dur >= targetSec || i === project.scenes.length - 1) {
          StudioState.video.sceneIndex = i;
          StudioState.video.elapsedSceneSeconds = Math.max(0, targetSec - accumulated);
          StudioState.video.lastSpokenKey = "";
          break;
        }
        accumulated += dur;
      }
      this.render();
    },

    nextScene() {
      const project = StudioState.getActiveProject();
      if (!project || !project.scenes) return;
      if (StudioState.video.sceneIndex + 1 < project.scenes.length) {
        StudioState.video.sceneIndex++;
        StudioState.video.elapsedSceneSeconds = 0;
        StudioState.video.lastSpokenKey = "";
        this.render();
      }
    },

    previousScene() {
      if (StudioState.video.sceneIndex > 0) {
        StudioState.video.sceneIndex--;
        StudioState.video.elapsedSceneSeconds = 0;
        StudioState.video.lastSpokenKey = "";
        this.render();
      }
    }
  };

  /* ==========================================================================
     10. MY PROJECTS VIEW RENDERER & CRUD
     ========================================================================== */
  const ProjectsRenderer = {
    init() {
      const searchInput = document.getElementById("projectSearchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          StudioState.projectSearchQuery = e.target.value.toLowerCase().trim();
          this.render();
        });
      }

      document.querySelectorAll(".filter-chips .chip").forEach(chip => {
        chip.addEventListener("click", () => {
          document.querySelectorAll(".filter-chips .chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          StudioState.projectFilter = chip.dataset.filter;
          this.render();
        });
      });
    },

    render() {
      const grid = document.getElementById("allProjectsGrid");
      if (!grid) return;
      grid.innerHTML = "";

      let filtered = StudioState.projects.filter(p => {
        if (StudioState.projectFilter !== "all" && p.status !== StudioState.projectFilter) {
          return false;
        }
        if (StudioState.projectSearchQuery) {
          const q = StudioState.projectSearchQuery;
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchTopic = p.topic.toLowerCase().includes(q);
          const matchGrammar = (p.grammar || "").toLowerCase().includes(q);
          return matchTitle || matchTopic || matchGrammar;
        }
        return true;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-secondary);">
            <i class="fa-solid fa-folder-closed" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.6;"></i>
            <p style="font-size: 1.1rem; font-weight: 600;">No curriculum projects found</p>
            <p style="font-size: 0.85rem; margin-top: 4px;">Adjust your search filters or create a new lesson project.</p>
          </div>
        `;
        return;
      }

      filtered.forEach(proj => {
        const isCurrent = proj.id === StudioState.activeProjectId;
        const card = document.createElement("div");
        card.className = "project-card";
        card.style.cssText = `
          background: var(--bg-surface);
          border: 1px solid ${isCurrent ? "var(--accent-purple)" : "var(--border-color)"};
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          transition: transform 0.2s ease, border-color 0.2s ease;
        `;

        card.innerHTML = `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span class="badge ${proj.status === 'Ready' ? 'badge-green' : 'badge-amber'}">${proj.status}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${proj.scenes ? proj.scenes.length : 0} SCENES</span>
            </div>
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 6px; line-height: 1.3;">
              ${escapeHtml(proj.title)}
            </h3>
            <p style="font-size: 0.82rem; color: var(--accent-blue); margin-bottom: 4px;">
              <i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(proj.schoolLevel)}
            </p>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              ${escapeHtml(proj.topic)}
            </p>
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-primary btn-small open-project-btn" data-id="${proj.id}">
              <i class="fa-solid fa-clapperboard"></i> Open Studio
            </button>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-icon btn-small sync-cloud-btn" title="Sync to Firebase Firestore" data-id="${proj.id}">
                <i class="fa-solid fa-cloud-arrow-up"></i>
              </button>
              <button class="btn btn-icon btn-small rename-project-btn" title="Rename" data-id="${proj.id}">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-icon btn-small duplicate-project-btn" title="Duplicate" data-id="${proj.id}">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="btn btn-icon btn-small delete-project-btn" title="Delete" data-id="${proj.id}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;

        card.querySelector(".open-project-btn").addEventListener("click", () => {
          StudioState.setActiveProject(proj.id);
          NavigationRouter.navigateTo("video-studio");
        });

        card.querySelector(".sync-cloud-btn").addEventListener("click", () => {
          SaveToFirebaseManager.syncProject(proj);
        });

        card.querySelector(".rename-project-btn").addEventListener("click", () => {
          RenameModalManager.open(proj);
        });

        card.querySelector(".duplicate-project-btn").addEventListener("click", () => {
          this.duplicateProject(proj.id);
        });

        card.querySelector(".delete-project-btn").addEventListener("click", () => {
          this.deleteProject(proj.id);
        });

        grid.appendChild(card);
      });
    },

    duplicateProject(id) {
      const original = StudioState.projects.find(p => p.id === id);
      if (!original) return;

      const copy = JSON.parse(JSON.stringify(original));
      copy.id = "proj_" + Date.now();
      copy.title = `${copy.title} (Copy)`;
      copy.scenes = copy.scenes.map((s, idx) => ({
        ...s,
        id: "scene_" + Date.now() + "_" + idx
      }));

      StudioState.projects.unshift(copy);
      StudioState.save();
      this.render();
      DashboardRenderer.render();
      showToast(`Duplicated project "${copy.title}"`, "success");
    },

    deleteProject(id) {
      if (StudioState.projects.length <= 1) {
        showToast("Cannot delete the last remaining project.", "error");
        return;
      }

      const target = StudioState.projects.find(p => p.id === id);
      const title = target ? target.title : "Project";

      StudioState.projects = StudioState.projects.filter(p => p.id !== id);
      if (StudioState.activeProjectId === id) {
        StudioState.activeProjectId = StudioState.projects[0].id;
      }

      StudioState.save();
      this.render();
      DashboardRenderer.render();
      NavigationRouter.updateSidebarActiveCard();
      showToast(`Deleted "${title}"`, "info");
    }
  };

  /* ==========================================================================
     11. MODAL MANAGERS & SPECIALIZED GENERATORS
     ========================================================================== */

  function setupModalDismissals() {
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close-modal");
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add("hidden");
      });
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.add("hidden");
        }
      });
    });
  }

  // 11.A AI Script Coach Manager (Feature #4)
  const ScriptCoachManager = {
    init() {
      const form = document.getElementById("scriptCoachForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handlePolish();
        });
      }
    },

    open() {
      const modal = document.getElementById("scriptCoachModal");
      const project = StudioState.getActiveProject();
      if (!modal || !project || !project.scenes || project.scenes.length === 0) return;

      const currentScene = project.scenes[StudioState.video.sceneIndex];
      if (!currentScene) return;

      document.getElementById("scriptCoachCurrentNarration").value = currentScene.narration;
      modal.classList.remove("hidden");
    },

    async handlePolish() {
      const project = StudioState.getActiveProject();
      if (!project || !project.scenes) return;

      const currentScene = project.scenes[StudioState.video.sceneIndex];
      if (!currentScene) return;

      const goal = document.getElementById("scriptCoachGoalInput").value.trim();
      const submitBtn = document.getElementById("scriptCoachSubmitBtn");
      const originalHtml = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Polishing Narration...`;

      try {
        const response = await fetch(API_CONFIG.get('/api/ai/generate-script'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneTitle: currentScene.title,
            goal: goal,
            level: project.schoolLevel,
            grammar: project.grammar,
            currentNarration: currentScene.narration
          })
        });

        const result = await parseApiResponse(response);

        const data = result.data;
        if (data.polishedNarration) {
          currentScene.narration = data.polishedNarration;
        }
        if (data.visualPrompt) {
          currentScene.visualPrompt = data.visualPrompt;
        }
        if (data.characterAction) {
          currentScene.characterAction = data.characterAction;
        }
        if (data.cameraAngle) {
          currentScene.cameraAngle = data.cameraAngle;
        }

        StudioState.save();
        document.getElementById("scriptCoachModal").classList.add("hidden");
        VideoStudioRenderer.render();
        showToast("Scene narration & 3D staging enhanced with Gemini AI!", "success");
      } catch (err) {
        console.error('Script Coach error:', err);
        showToast(err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    }
  };

  // 11.B School Topic and Reading Text Generator Manager (Feature #5)
  const ReadingGeneratorManager = {
    init() {
      const form = document.getElementById("readingGeneratorForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
      }
    },

    open() {
      const modal = document.getElementById("readingGeneratorModal");
      const project = StudioState.getActiveProject();
      if (modal) {
        if (project) {
          document.getElementById("readingSubjectInput").value = project.topic || "";
          document.getElementById("readingLevelInput").value = project.schoolLevel || "Intermediate (B1)";
        }
        modal.classList.remove("hidden");
      }
    },

    async handleGenerate() {
      const subject = document.getElementById("readingSubjectInput").value.trim();
      const level = document.getElementById("readingLevelInput").value;
      const submitBtn = document.getElementById("readingSubmitBtn");
      const originalHtml = submitBtn.innerHTML;

      if (!subject) {
        showToast("Please enter a curriculum subject or theme.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating Reading Passage...`;

      try {
        const response = await fetch(API_CONFIG.get('/api/ai/generate-reading'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, level })
        });

        const result = await parseApiResponse(response);

        const data = result.data;
        const project = StudioState.getActiveProject();

        if (project) {
          project.topic = data.topicTitle || subject;
          project.lessonContent = data.readingPassage;
          if (data.targetVocabulary && data.targetVocabulary.length > 0) {
            project.vocabulary = data.targetVocabulary.join(", ");
          }

          project.aiWorksheetData = {
            vocabularyMatching: (data.targetVocabulary || ["concept", "structure", "perspective"]).map((term, i) => ({
              term: term,
              definition: `Key pedagogical vocabulary in context of ${subject}`,
              letter: String.fromCharCode(65 + i)
            })),
            clozeExercises: (data.comprehensionQuestions || []).map((q, i) => ({
              sentence: `${q} The text indicates that ________ (demonstrate) this principle.`,
              targetWord: "demonstrates"
            })),
            readingScenario: {
              title: data.topicTitle || subject,
              passage: data.readingPassage,
              criticalThinkingQuestion: data.classroomDiscussionTopic || "How does this reading apply to real-world communication?"
            },
            speakingPrompt: data.classroomDiscussionTopic || "Discuss your viewpoint with your partner."
          };

          StudioState.save();
          DashboardRenderer.render();
          WorksheetRenderer.render();
          NavigationRouter.updateSidebarActiveCard();
        }

        document.getElementById("readingGeneratorModal").classList.add("hidden");
        NavigationRouter.navigateTo("worksheet-generator");
        showToast("Curriculum reading text synthesized and inserted into worksheet!", "success");
      } catch (err) {
        console.error('Reading generation error:', err);
        showToast(err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    }
  };

  // 11.C Save to Firebase Firestore Manager
  const SaveToFirebaseManager = {
    async syncActiveProject() {
      const project = StudioState.getActiveProject();
      if (!project) {
        showToast("No active project to sync.", "error");
        return;
      }
      await this.syncProject(project);
    },

    async syncProject(project) {
      const topBtn = document.getElementById("topbarSaveFirebaseBtn");
      const originalHtml = topBtn ? topBtn.innerHTML : "";
      if (topBtn) {
        topBtn.disabled = true;
        topBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
      }

      try {
        const response = await fetch(API_CONFIG.get('/api/projects/save-to-firebase'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: project, userId: "studio_creator" })
        });

        const result = await parseApiResponse(response);

        showToast(result.message || `Project "${project.title}" saved to Firebase!`, "success");
      } catch (err) {
        console.error('Firebase save error:', err);
        showToast(`Saved locally. (${err.message})`, "info");
      } finally {
        if (topBtn) {
          topBtn.disabled = false;
          topBtn.innerHTML = originalHtml;
        }
      }
    }
  };

  // 11.D Create Project Modal Manager
  const CreateProjectModalManager = {
    init() {
      const openTriggers = ["topbarNewProjectBtn", "projectsNewBtn", "heroCreateBtn"];
      openTriggers.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener("click", () => this.open());
        }
      });

      const form = document.getElementById("createProjectForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleCreate();
        });
      }
    },

    open() {
      const modal = document.getElementById("createProjectModal");
      if (modal) {
        document.getElementById("createProjectForm").reset();
        modal.classList.remove("hidden");
        document.getElementById("newModalTitle").focus();
      }
    },

    handleCreate() {
      const title = document.getElementById("newModalTitle").value.trim();
      const topic = document.getElementById("newModalTopic").value.trim() || "English Grammar & Conversation";
      const level = document.getElementById("newModalLevel").value;
      const duration = parseInt(document.getElementById("newModalDuration").value, 10) || 3;
      const grammar = document.getElementById("newModalGrammar").value.trim() || "Target Pattern";

      if (!title) {
        showToast("Please enter a project title.", "error");
        return;
      }

      const defaultScenes = [
        {
          id: "scene_" + Date.now() + "_1",
          sceneNumber: 1,
          title: "Introduction & Context",
          visualPrompt: `3D Teacher in contemporary studio welcoming learners to "${escapeHtml(title)}"`,
          narration: `Hello everyone! Welcome to ${title}. Today we discover key expressions and structures.`,
          durationSeconds: 15,
          characterAction: "Warm greeting to camera",
          cameraAngle: "Medium Shot",
          environment: "Modern Academy"
        },
        {
          id: "scene_" + Date.now() + "_2",
          sceneNumber: 2,
          title: "Key Breakdown & Demonstration",
          visualPrompt: `Animated virtual whiteboard showing rule for ${escapeHtml(grammar)} with clear examples`,
          narration: `Here is the essential rule in action. Notice the relationship between each word.`,
          durationSeconds: 22,
          characterAction: "Highlighting text on digital display",
          cameraAngle: "Medium Close-Up",
          environment: "Modern Academy"
        }
      ];

      const newProject = {
        id: "proj_" + Date.now(),
        userId: "studio_creator",
        title: title,
        topic: topic,
        schoolLevel: level,
        durationMinutes: duration,
        objectives: `Master ${topic} with practical communicative confidence.`,
        vocabulary: "expression, structure, concept, dialogue",
        grammar: grammar,
        lessonContent: `Interactive pedagogical module on ${topic}.`,
        status: "In Production",
        sceneCount: defaultScenes.length,
        scenes: defaultScenes
      };

      StudioState.projects.unshift(newProject);
      StudioState.setActiveProject(newProject.id);
      StudioState.save();

      document.getElementById("createProjectModal").classList.add("hidden");
      NavigationRouter.navigateTo("video-studio");
      showToast(`Created new project "${title}"!`, "success");
    }
  };

  // 11.E Rename Project Modal
  const RenameModalManager = {
    init() {
      const form = document.getElementById("renameForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleRename();
        });
      }
    },

    open(project) {
      const modal = document.getElementById("renameModal");
      if (!modal) return;
      document.getElementById("renameProjectId").value = project.id;
      const titleInput = document.getElementById("renameTitleInput");
      titleInput.value = project.title;
      modal.classList.remove("hidden");
      titleInput.focus();
    },

    handleRename() {
      const id = document.getElementById("renameProjectId").value;
      const newTitle = document.getElementById("renameTitleInput").value.trim();
      if (!newTitle) return;

      const project = StudioState.projects.find(p => p.id === id);
      if (project) {
        project.title = newTitle;
        StudioState.save();
        document.getElementById("renameModal").classList.add("hidden");
        ProjectsRenderer.render();
        DashboardRenderer.render();
        NavigationRouter.updateSidebarActiveCard();
        showToast("Project title updated", "success");
      }
    }
  };

  // 11.F Add / Edit Scene Modal
  const SceneModalManager = {
    init() {
      const form = document.getElementById("sceneEditorForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleSave();
        });
      }
    },

    openForAdd() {
      const modal = document.getElementById("sceneEditorModal");
      if (!modal) return;
      document.getElementById("sceneModalHeading").textContent = "Add Storyboard Scene";
      document.getElementById("sceneEditId").value = "";
      document.getElementById("sceneTitleInput").value = "";
      document.getElementById("scenePromptInput").value = "";
      document.getElementById("sceneNarrationInput").value = "";
      document.getElementById("sceneDurationInput").value = "18";
      document.getElementById("sceneAngleInput").value = "Medium Shot";
      const typeEl = document.getElementById("sceneTypeInput");
      if (typeEl) typeEl.value = "listening";
      const envEl = document.getElementById("sceneEnvironmentInput");
      if (envEl) envEl.value = "Modern Classroom";
      modal.classList.remove("hidden");
      document.getElementById("sceneTitleInput").focus();
    },

    openForEdit(scene) {
      const modal = document.getElementById("sceneEditorModal");
      if (!modal) return;
      document.getElementById("sceneModalHeading").textContent = "Edit Storyboard Scene";
      document.getElementById("sceneEditId").value = scene.id;
      document.getElementById("sceneTitleInput").value = scene.title;
      document.getElementById("scenePromptInput").value = scene.visualPrompt;
      document.getElementById("sceneNarrationInput").value = scene.narration;
      document.getElementById("sceneDurationInput").value = scene.durationSeconds;
      document.getElementById("sceneAngleInput").value = scene.cameraAngle || "Medium Shot";
      const typeEl = document.getElementById("sceneTypeInput");
      if (typeEl) typeEl.value = scene.sceneType || VideoCanvasEngine.getSceneType(scene, 0);
      const envEl = document.getElementById("sceneEnvironmentInput");
      if (envEl) envEl.value = scene.environment || "Modern Classroom";
      modal.classList.remove("hidden");
      document.getElementById("sceneTitleInput").focus();
    },

    handleSave() {
      const project = StudioState.getActiveProject();
      if (!project) return;

      const editId = document.getElementById("sceneEditId").value;
      const title = document.getElementById("sceneTitleInput").value.trim();
      const prompt = document.getElementById("scenePromptInput").value.trim() || "Virtual teacher presentation";
      const narration = document.getElementById("sceneNarrationInput").value.trim() || "Notice the dialogue structure.";
      const duration = parseInt(document.getElementById("sceneDurationInput").value, 10) || 15;
      const angle = document.getElementById("sceneAngleInput").value;
      const typeEl = document.getElementById("sceneTypeInput");
      const envEl = document.getElementById("sceneEnvironmentInput");
      const sceneType = typeEl ? typeEl.value : "listening";
      const environment = envEl ? envEl.value : "Modern Classroom";

      if (!title) {
        showToast("Please enter a scene title.", "error");
        return;
      }

      if (editId) {
        const scene = project.scenes.find(s => s.id === editId);
        if (scene) {
          scene.title = title;
          scene.visualPrompt = prompt;
          scene.narration = narration;
          scene.durationSeconds = duration;
          scene.cameraAngle = angle;
          scene.sceneType = sceneType;
          scene.environment = environment;
          showToast("Scene updated successfully", "success");
        }
      } else {
        const newScene = {
          id: "scene_" + Date.now(),
          sceneNumber: project.scenes.length + 1,
          sceneType: sceneType,
          title: title,
          visualPrompt: prompt,
          narration: narration,
          durationSeconds: duration,
          characterAction: "Engaging classroom instruction",
          cameraAngle: angle,
          environment: environment
        };
        project.scenes.push(newScene);
        showToast("New scene added to storyboard", "success");
      }

      StudioState.save();
      document.getElementById("sceneEditorModal").classList.add("hidden");
      VideoStudioRenderer.render();
      DashboardRenderer.render();
    }
  };

  const VideoGeneratorManager = {
    audioCtx: null,
    audioDest: null,

    init() {
      // Button listener added in VideoStudioRenderer.init
    },

    getSupportedMimeType() {
      if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
        return '';
      }
      const candidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];
      return candidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
    },

    playChime(freq = 587) {
      try {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);
        osc.connect(gain);
        if (this.audioDest) gain.connect(this.audioDest);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.36);
      } catch (e) {}
    },

    async handleGenerate() {
      const project = StudioState.getActiveProject();
      if (!project || !project.scenes || project.scenes.length === 0) {
        showToast("No scenes available to render.", "error");
        return;
      }

      const canvas = document.getElementById("videoStageCanvas");
      if (!canvas || typeof canvas.captureStream !== 'function') {
        showToast("Canvas video capture is not supported in this browser/WebView.", "error");
        return;
      }

      if (typeof MediaRecorder === 'undefined') {
        showToast("MediaRecorder API is unavailable in this environment.", "error");
        return;
      }

      const btn = document.getElementById("generateVideoBtn");
      const originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Recording WebM...`;
      StudioState.video.isExporting = true;

      try {
        const videoStream = canvas.captureStream(30);
        let finalStream = videoStream;

        // Attach subtle cue audio track via Web Audio API when supported
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            this.audioCtx = new AudioCtx();
            this.audioDest = this.audioCtx.createMediaStreamDestination();
            finalStream = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...this.audioDest.stream.getAudioTracks()
            ]);
            this.playChime(523);
          }
        } catch (audioErr) {
          console.warn("Audio track attachment skipped:", audioErr);
          finalStream = videoStream;
        }

        const mimeType = this.getSupportedMimeType();
        const recorderOptions = mimeType ? { mimeType } : {};
        const mediaRecorder = new MediaRecorder(finalStream, recorderOptions);
        const chunks = [];
        const isMp4 = mimeType && mimeType.includes('mp4');
        const ext = isMp4 ? 'mp4' : 'webm';

        mediaRecorder.ondataavailable = e => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${project.title.replace(/[^a-z0-9]+/gi, '_')}_lesson.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          if (this.audioCtx) {
            try { this.audioCtx.close(); } catch (e) {}
            this.audioCtx = null;
          }
          showToast(`${ext.toUpperCase()} Video Export Complete!`, "success");
          StudioState.video.isExporting = false;
          btn.disabled = false;
          btn.innerHTML = originalHtml;
          VideoStudioRenderer.render();
        };

        StudioState.video.sceneIndex = 0;
        StudioState.video.elapsedSceneSeconds = 0;
        StudioState.video.lastSpokenKey = "";
        VideoStudioRenderer.play();
        mediaRecorder.start(250);

        const totalDurationMs = project.scenes.reduce((a, b) => a + b.durationSeconds, 0) * 1000;
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          VideoStudioRenderer.pause();
        }, totalDurationMs + 600);

      } catch (err) {
        console.error('Recording error:', err);
        showToast("Recording failed: " + err.message, "error");
        StudioState.video.isExporting = false;
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }
  };

  /* ==========================================================================
     11.5 WORKSHEET ANALYZER MANAGER
     ========================================================================== */
  const WorksheetAnalyzerManager = {
    selectedFile: null,
    analysisData: null,

    init() {
      const dropzone = document.getElementById("worksheetDropzone");
      const fileInput = document.getElementById("worksheetFileInput");
      const selectBtn = document.getElementById("selectFileBtn");
      const analyzeBtn = document.getElementById("analyzeWorksheetBtn");
      const clearBtn = document.getElementById("clearFileBtn");
      const resetBtn = document.getElementById("resetAnalysisBtn");
      const createVideoBtn = document.getElementById("createVideoFromAnalysisBtn");

      if (!dropzone) return;

      selectBtn.addEventListener("click", () => fileInput.click());
      
      fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
      
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
      dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
          this.processFile(e.dataTransfer.files[0]);
        }
      });

      analyzeBtn.addEventListener("click", () => this.handleAnalyze());
      if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.clearFile();
        });
      }
      if (resetBtn) resetBtn.addEventListener("click", () => this.reset());
      if (createVideoBtn) createVideoBtn.addEventListener("click", () => this.createVideo());
    },

    handleFileSelect(e) {
      if (e.target.files.length > 0) {
        this.processFile(e.target.files[0]);
      }
    },

    processFile(file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ];

      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx')) {
        showToast("Unsupported file format. Please upload PDF, DOCX, or images.", "error");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast("File too large. Maximum size is 10MB.", "error");
        return;
      }

      this.selectedFile = file;
      document.getElementById("fileNameLabel").textContent = file.name;
      document.getElementById("selectedFileName").classList.remove("hidden");
      document.getElementById("analyzeWorksheetBtn").disabled = false;
    },

    clearFile() {
      this.selectedFile = null;
      document.getElementById("worksheetFileInput").value = "";
      document.getElementById("selectedFileName").classList.add("hidden");
      document.getElementById("analyzeWorksheetBtn").disabled = true;
    },

    async handleAnalyze() {
      if (!this.selectedFile) return;

      const analyzeBtn = document.getElementById("analyzeWorksheetBtn");
      const originalHtml = analyzeBtn.innerHTML;
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with Gemini AI...`;

      try {
        const base64 = await this.fileToBase64(this.selectedFile);
        
        const response = await fetch(API_CONFIG.get('/api/ai/analyze-worksheet'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: this.selectedFile.name,
            mimeType: this.selectedFile.type || (this.selectedFile.name.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : ''),
            base64: base64
          })
        });

        const result = await parseApiResponse(response);
        this.analysisData = result.data;
        this.showAnalysis(result.data);
        showToast("Worksheet successfully analyzed!", "success");
      } catch (err) {
        console.error('Analysis error:', err);
        showToast(err.message, "error");
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalHtml;
      }
    },

    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = error => reject(error);
      });
    },

    showAnalysis(data) {
      document.getElementById("analysisTitle").value = data.title || "";
      document.getElementById("analysisTopic").value = data.topic || "";
      document.getElementById("analysisLevel").value = data.level || "";
      document.getElementById("analysisGrammar").value = data.grammar || "";
      document.getElementById("analysisVocab").value = (data.vocabulary || []).join(", ");
      document.getElementById("analysisPassage").value = data.passage || "";

      const statsList = document.getElementById("analysisStatsList");
      statsList.innerHTML = "";
      if (data.passage) statsList.innerHTML += `<li><i class="fa-solid fa-check"></i> Reading Passage Detected</li>`;
      if (data.grammar) statsList.innerHTML += `<li><i class="fa-solid fa-check"></i> Grammar Patterns Identified</li>`;
      if (data.vocabulary && data.vocabulary.length > 0) statsList.innerHTML += `<li><i class="fa-solid fa-check"></i> ${data.vocabulary.length} Vocabulary Words Extracted</li>`;
      if (data.hasQuestions) statsList.innerHTML += `<li><i class="fa-solid fa-check"></i> Exercises/Questions Identified</li>`;

      const unclearBox = document.getElementById("unclearSectionsBox");
      if (data.unclearSections && data.unclearSections.toLowerCase() !== 'none') {
        unclearBox.classList.remove("hidden");
        document.getElementById("unclearContentLabel").textContent = data.unclearSections;
      } else {
        unclearBox.classList.add("hidden");
      }

      document.getElementById("analysisPreviewContainer").classList.remove("hidden");
      document.getElementById("analysisPreviewContainer").scrollIntoView({ behavior: 'smooth' });
    },

    reset() {
      this.analysisData = null;
      document.getElementById("analysisPreviewContainer").classList.add("hidden");
      this.clearFile();
    },

    createVideo() {
      if (!this.analysisData) return;

      // Transfer data to Lesson Generator
      document.getElementById("lessonTitle").value = document.getElementById("analysisTitle").value;
      document.getElementById("lessonTopic").value = document.getElementById("analysisTopic").value;
      document.getElementById("lessonLevel").value = this.mapLevel(document.getElementById("analysisLevel").value);
      document.getElementById("lessonGrammar").value = document.getElementById("analysisGrammar").value;
      document.getElementById("lessonVocab").value = document.getElementById("analysisVocab").value;
      document.getElementById("lessonContentNotes").value = document.getElementById("analysisPassage").value;

      showToast("Transferring worksheet content to Lesson Generator...", "info");
      NavigationRouter.navigateTo("lesson-generator");
    },

    mapLevel(levelStr) {
      if (!levelStr) return "Intermediate (B1)";
      const l = levelStr.toUpperCase();
      if (l.includes("A1")) return "Beginner (A1)";
      if (l.includes("A2")) return "Elementary (A2)";
      if (l.includes("B1")) return "Intermediate (B1)";
      if (l.includes("B2")) return "Upper-Intermediate (B2)";
      if (l.includes("C1")) return "Advanced (C1)";
      return "Intermediate (B1)"; // Default
    }
  };

  /* ==========================================================================
     12. UTILITY HELPERS
     ========================================================================== */
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatTimecode(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  /* ==========================================================================
     13. APPLICATION BOOTSTRAP
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    StudioState.init();
    NavigationRouter.init();
    
    // Perform Backend Health Check
    fetch(API_CONFIG.get('/api/health'))
      .then(r => {
        const contentType = r.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return r.json();
        }
        throw new Error("Non-JSON response (Sandbox auth proxy)");
      })
      .then(data => {
        console.log("Backend Connected:", data);
        if (!data.hasGeminiApiKey) {
          showToast("Gemini API Key missing in backend config.", "error");
        }
      })
      .catch(err => {
        console.warn("Backend health check notice:", err.message);
      });

    DashboardRenderer.render();
    LessonGeneratorController.init();
    WorksheetRenderer.init();
    QuizRenderer.init();
    VideoStudioRenderer.init();
    ProjectsRenderer.init();

    setupModalDismissals();
    CreateProjectModalManager.init();
    RenameModalManager.init();
    SceneModalManager.init();
    ScriptCoachManager.init();
    ReadingGeneratorManager.init();
    VideoGeneratorManager.init();
    WorksheetAnalyzerManager.init();

    NavigationRouter.updateSidebarActiveCard();
    console.log("English Lenses Educational Video Studio ready. Connected to Secure Gemini AI Backend.");
  });

})();
