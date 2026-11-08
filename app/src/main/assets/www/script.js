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
      aspectRatio: "16:9"
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
        } catch (e) {
          console.warn("Failed to parse stored projects, falling back to seed", e);
          this.projects = JSON.parse(JSON.stringify(INITIAL_DEMO_PROJECTS));
        }
      } else {
        this.projects = JSON.parse(JSON.stringify(INITIAL_DEMO_PROJECTS));
        this.save();
      }

      const activeId = localStorage.getItem("english_lenses_active_project");
      if (activeId && this.projects.some(p => p.id === activeId)) {
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
        this.stopVideoPlayback();
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
          title: s.title || `Scene ${idx + 1}`,
          visualPrompt: s.visualPrompt || "Virtual classroom staging with floating neon text",
          narration: s.narration || "Welcome to today's English lesson.",
          durationSeconds: s.durationSeconds || (idx === 1 ? 24 : 18),
          characterAction: s.characterAction || "Engaging eye contact and gestures",
          cameraAngle: s.cameraAngle || "Medium Shot",
          environment: "Futuristic Studio"
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

        showToast("Gemini AI successfully synthesized 3 pedagogical scenes!", "success");

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
     8.5 DYNAMIC VIDEO STAGE CANVAS ENGINE (60 FPS Graphics & Avatar Animation)
     ========================================================================== */
  const VideoCanvasEngine = {
    canvas: null,
    ctx: null,
    animId: null,
    particles: [],
    starfield: [],

    init() {
      this.canvas = document.getElementById("videoStageCanvas");
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d");

      this.particles = [];
      for (let i = 0; i < 35; i++) {
        this.particles.push({
          x: Math.random() * 960,
          y: Math.random() * 540,
          r: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: -Math.random() * 0.8 - 0.2,
          alpha: Math.random() * 0.7 + 0.3,
          color: ['#a855f7', '#38bdf8', '#34d399', '#f43f5e'][Math.floor(Math.random() * 4)]
        });
      }

      this.starfield = [];
      for (let i = 0; i < 90; i++) {
        this.starfield.push({
          x: (Math.random() - 0.5) * 960,
          y: (Math.random() - 0.5) * 540,
          z: Math.random() * 960 + 1,
          size: Math.random() * 2 + 1
        });
      }

      this.startLoop();
    },

    startLoop() {
      if (this.animId) cancelAnimationFrame(this.animId);
      const render = () => {
        this.drawFrame();
        this.animId = requestAnimationFrame(render);
      };
      this.animId = requestAnimationFrame(render);
    },

    drawFrame() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const time = Date.now() / 1000;

      const project = StudioState.getActiveProject();
      const scenes = project ? (project.scenes || []) : [];
      const currentScene = scenes[StudioState.video.sceneIndex] || null;
      const env = (currentScene && currentScene.environment) ? currentScene.environment : 'Default Studio';
      const isPlaying = StudioState.video.isPlaying;

      this.drawEnvironment(ctx, w, h, env, time, currentScene);

      ctx.save();
      let zoom = 1.0;
      let panX = 0;
      let panY = 0;

      const angle = currentScene ? (currentScene.cameraAngle || 'Medium Shot') : 'Medium Shot';
      if (angle === 'Close-Up') { zoom = 1.35; panY = -30; }
      else if (angle === 'Medium Close-Up') { zoom = 1.2; panY = -15; }
      else if (angle === 'Wide Two-Shot') { zoom = 0.9; panX = -40; }
      else if (angle === 'Over-Shoulder') { zoom = 1.15; panX = 30; }

      const floatY = Math.sin(time * 1.5) * 3;
      const floatX = Math.cos(time * 1.1) * 2;

      ctx.translate(w / 2 + panX + floatX, h / 2 + panY + floatY);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      this.drawParticles(ctx, w, h, time);
      this.drawAvatar(ctx, w, h, time, isPlaying, currentScene);
      this.drawHologramBoard(ctx, w, h, time, currentScene, project);

      ctx.restore();
    },

    drawEnvironment(ctx, w, h, env, time, currentScene) {
      if (env.includes('Bridge') || env.includes('Cosmos') || env.includes('Sci-Fi')) {
        const grad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, w);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#ffffff';
        this.starfield.forEach(s => {
          s.z -= (StudioState.video.isPlaying ? 4 : 0.8);
          if (s.z <= 0) s.z = 960;
          const k = 400 / s.z;
          const px = s.x * k + w / 2;
          const py = s.y * k + h / 2;
          if (px >= 0 && px <= w && py >= 0 && py <= h) {
            const alpha = (1 - s.z / 960);
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(px, py, s.size * (1 - s.z / 960) * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1.0;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w/2, h + 100, 520, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else if (env.includes('Courtyard') || env.includes('Park')) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.4, '#4c1d95');
        skyGrad.addColorStop(0.7, '#e11d48');
        skyGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.35, 70, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.72);
        ctx.quadraticCurveTo(w * 0.4, h * 0.65, w, h * 0.75);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();
      } else if (env.includes('Classroom') || env.includes('Hallway')) {
        const roomGrad = ctx.createLinearGradient(0, 0, 0, h);
        roomGrad.addColorStop(0, '#0f172a');
        roomGrad.addColorStop(0.5, '#1e293b');
        roomGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = roomGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        const horizonY = h * 0.55;
        for (let x = -200; x <= w + 200; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, h);
          ctx.lineTo(w / 2 + (x - w / 2) * 0.15, horizonY);
          ctx.stroke();
        }
        for (let y = horizonY; y <= h; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.fillRect(80, 50, w - 160, 220);
        ctx.strokeRect(80, 50, w - 160, 220);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = '600 16px sans-serif';
        ctx.fillText("ENGLISH LENSES ACADEMY", 110, 85);
        ctx.font = '500 13px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText("Target Pattern: " + (currentScene ? currentScene.title : "Pedagogical Grammar"), 110, 115);
      } else {
        const grad = ctx.createRadialGradient(w/2, h/2, 40, w/2, h/2, w*0.7);
        grad.addColorStop(0, '#2e1065');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    },

    drawParticles(ctx, w, h, time) {
      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) p.y = h;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 2 + p.x));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    },

    drawAvatar(ctx, w, h, time, isPlaying, scene) {
      const cx = w * 0.32;
      const cy = h * 0.92;

      ctx.save();
      const auraGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110);
      auraGrad.addColorStop(0, isPlaying ? 'rgba(168, 85, 247, 0.45)' : 'rgba(56, 189, 248, 0.3)');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 110, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      const breathY = Math.sin(time * 2) * 2;
      ctx.translate(cx, cy + breathY);

      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.quadraticCurveTo(-65, -120, -50, -170);
      ctx.lineTo(50, -170);
      ctx.quadraticCurveTo(65, -120, 60, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-20, -170);
      ctx.lineTo(0, -110);
      ctx.lineTo(20, -170);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(-6, -170);
      ctx.lineTo(6, -170);
      ctx.lineTo(8, -120);
      ctx.lineTo(0, -100);
      ctx.lineTo(-8, -120);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(45, -150);
      const armWave = isPlaying ? Math.sin(time * 5) * 12 : 0;
      ctx.quadraticCurveTo(90, -170 + armWave, 120, -190 + armWave);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(125, -192 + armWave, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-15, -200, 30, 35);

      ctx.beginPath();
      ctx.ellipse(0, -235, 42, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(0, -265, 46, 28, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      const blinkCycle = Math.sin(time * 1.2);
      const isBlinking = blinkCycle > 0.94;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-16, -240, 9, isBlinking ? 1 : 7, 0, 0, Math.PI * 2);
      ctx.ellipse(16, -240, 9, isBlinking ? 1 : 7, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!isBlinking) {
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(-16, -240, 4.5, 0, Math.PI * 2);
        ctx.arc(16, -240, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-18, -242, 1.5, 0, Math.PI * 2);
        ctx.arc(14, -242, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-26, -252);
      ctx.quadraticCurveTo(-16, -256, -6, -252);
      ctx.moveTo(6, -252);
      ctx.quadraticCurveTo(16, -256, 26, -252);
      ctx.stroke();

      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      if (isPlaying) {
        const speechH = Math.abs(Math.sin(time * 14)) * 12 + 2;
        ctx.ellipse(0, -218, 11, speechH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -223, 16, 4);
      } else {
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 3;
        ctx.arc(0, -224, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    },

    drawHologramBoard(ctx, w, h, time, scene, project) {
      const bx = w * 0.52;
      const by = h * 0.18;
      const bw = 400;
      const bh = 260;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(bx, by, bw, bh, 12);
      } else {
        ctx.rect(bx, by, bw, bh);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      [ [bx + 12, by + 12], [bx + bw - 12, by + 12], [bx + 12, by + bh - 12], [bx + bw - 12, by + bh - 12] ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 18px sans-serif';
      const boardTitle = scene ? scene.title : (project ? project.title : 'English Lesson');
      ctx.fillText(boardTitle.length > 30 ? boardTitle.substring(0, 28) + "..." : boardTitle, bx + 20, by + 36);

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      ctx.moveTo(bx + 20, by + 48);
      ctx.lineTo(bx + bw - 20, by + 48);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 13px sans-serif';
      ctx.fillText("3D VISUAL PROMPT & STAGING", bx + 20, by + 72);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '400 13px sans-serif';
      const promptText = scene ? scene.visualPrompt : 'Interactive 3D Stage Environment';
      const words = promptText.split(' ');
      let line = '';
      let currY = by + 94;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > bw - 40 && n > 0) {
          ctx.fillText(line, bx + 20, currY);
          line = words[n] + ' ';
          currY += 20;
          if (currY > by + bh - 60) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, bx + 20, currY);

      if (project && project.vocabulary) {
        const vocabFirst = project.vocabulary.split(',')[0] || 'Target Pattern';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(bx + 20, by + bh - 44, 210, 28, 14);
        } else {
          ctx.rect(bx + 20, by + bh - 44, 210, 28);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = '700 12px sans-serif';
        ctx.fillText("VOCAB: " + vocabFirst.trim().toUpperCase(), bx + 32, by + bh - 26);
      }

      ctx.restore();
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
    },

    render() {
      const project = StudioState.getActiveProject();
      if (!project) return;

      if (!VideoCanvasEngine.canvas) {
        VideoCanvasEngine.init();
      }
      VideoCanvasEngine.drawFrame();

      const scenes = project.scenes || [];
      const currentIdx = Math.min(StudioState.video.sceneIndex, Math.max(0, scenes.length - 1));
      StudioState.video.sceneIndex = currentIdx;

      const currentScene = scenes[currentIdx];

      const sceneBadge = document.getElementById("videoSceneBadge");
      if (sceneBadge) {
        sceneBadge.textContent = scenes.length > 0 ? `Scene ${currentIdx + 1} of ${scenes.length}` : "No Scenes";
      }

      const recBadge = document.getElementById("videoRecBadge");
      if (recBadge) {
        recBadge.innerHTML = StudioState.video.isPlaying 
          ? `<i class="fa-solid fa-circle" style="color: #ef4444; animation: pulse 1s infinite;"></i> REC 60FPS` 
          : `<i class="fa-solid fa-pause"></i> PAUSED`;
      }

      const avatarRig = document.getElementById("avatarRig");
      if (avatarRig) {
        if (StudioState.video.isPlaying) {
          avatarRig.classList.add("speaking");
        } else {
          avatarRig.classList.remove("speaking");
        }
      }

      const boardTitle = document.getElementById("videoBoardTitle");
      if (boardTitle) {
        boardTitle.textContent = currentScene ? currentScene.title : project.title;
      }

      const visualCue = document.getElementById("videoVisualCue");
      if (visualCue) {
        visualCue.innerHTML = currentScene ? `<i class="fa-solid fa-clapperboard"></i> 3D Staging: ${escapeHtml(currentScene.visualPrompt)}` : `<i class="fa-solid fa-clapperboard"></i> 3D Staging: Virtual Studio`;
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

        item.innerHTML = `
          <div class="scene-header-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="scene-num-badge">SCENE ${scene.sceneNumber || idx + 1}</span>
              <h4 style="font-size: 0.95rem; font-weight: bold; color: #fff;">${escapeHtml(scene.title)}</h4>
            </div>
            <div class="scene-controls-row">
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
            <div class="scene-box-label"><i class="fa-solid fa-wand-magic-sparkles"></i> 3D Staging & Visual Prompt</div>
            <div class="scene-box-text">${escapeHtml(scene.visualPrompt)}</div>
          </div>

          <div class="scene-box-content" style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2);">
            <div class="scene-box-label" style="color: var(--accent-purple-light);"><i class="fa-solid fa-microphone"></i> Spoken Teacher Narration</div>
            <div class="scene-box-text">"${escapeHtml(scene.narration)}"</div>
          </div>
        `;

        item.querySelector(".scene-jump-btn").addEventListener("click", () => {
          StudioState.video.sceneIndex = idx;
          StudioState.video.elapsedSceneSeconds = 0;
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

    speakNarration(text) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          if (!text) return;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("Speech synthesis unavailable:", e);
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
      const playBtn = document.getElementById("playPauseBtn");
      if (playBtn) {
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      }

      const currentScene = project.scenes[StudioState.video.sceneIndex];
      if (currentScene && currentScene.narration) {
        this.speakNarration(currentScene.narration);
      }

      this.render();

      StudioState.video.intervalId = setInterval(() => {
        this.tick();
      }, 500);
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

      StudioState.video.elapsedSceneSeconds += 0.5;

      if (StudioState.video.elapsedSceneSeconds >= currentScene.durationSeconds) {
        if (currentIdx + 1 < scenes.length) {
          StudioState.video.sceneIndex++;
          StudioState.video.elapsedSceneSeconds = 0;
          const nextScene = scenes[StudioState.video.sceneIndex];
          if (nextScene && nextScene.narration) {
            this.speakNarration(nextScene.narration);
          }
          this.render();
        } else {
          StudioState.video.sceneIndex = 0;
          StudioState.video.elapsedSceneSeconds = 0;
          this.pause();
          showToast("Storyboard video playback complete!", "success");
        }
      } else {
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
        this.render();
      }
    },

    previousScene() {
      if (StudioState.video.sceneIndex > 0) {
        StudioState.video.sceneIndex--;
        StudioState.video.elapsedSceneSeconds = 0;
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
          showToast("Scene updated successfully", "success");
        }
      } else {
        const newScene = {
          id: "scene_" + Date.now(),
          sceneNumber: project.scenes.length + 1,
          title: title,
          visualPrompt: prompt,
          narration: narration,
          durationSeconds: duration,
          characterAction: "Engaging classroom instruction",
          cameraAngle: angle,
          environment: "Virtual Studio"
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
    init() {
      // Listener initialized in VideoStudioRenderer
    },

    async handleGenerate() {
      const project = StudioState.getActiveProject();
      if (!project || !project.scenes || project.scenes.length === 0) {
        showToast("No scenes available to render.", "error");
        return;
      }

      const btn = document.getElementById("generateVideoBtn");
      const originalHtml = btn ? btn.innerHTML : "";
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Rendering MP4...`;
      }

      try {
        const response = await fetch(API_CONFIG.get('/api/ai/generate-video'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            title: project.title,
            scenes: project.scenes
          })
        });

        const result = await parseApiResponse(response).catch(() => null);
        if (result && result.videoUrl) {
          showToast("Video rendered successfully!", "success");
        } else {
          StudioState.video.sceneIndex = 0;
          StudioState.video.elapsedSceneSeconds = 0;
          VideoStudioRenderer.play();
          showToast("Playing Live 3D Interactive Video Studio Preview!", "success");
        }
      } catch (err) {
        StudioState.video.sceneIndex = 0;
        StudioState.video.elapsedSceneSeconds = 0;
        VideoStudioRenderer.play();
        showToast("Playing Live 3D Interactive Video Studio Preview!", "success");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      }
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

    NavigationRouter.updateSidebarActiveCard();
    console.log("English Lenses Educational Video Studio ready. Connected to Secure Gemini AI Backend.");
  });

})();
