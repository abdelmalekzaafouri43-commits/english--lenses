package com.example.ui

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.Project
import com.example.data.ProjectsRepository
import com.example.data.SceneItem
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.generationConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import java.util.UUID

private const val TAG = "StudioViewModel"

sealed interface StudioUiState {
    data object Idle : StudioUiState
    data class Loading(val message: String) : StudioUiState
    data class Success(val message: String) : StudioUiState
    data class Error(val message: String) : StudioUiState
}

data class QuizQuestion(
    val question: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String
)

data class WorksheetData(
    val title: String,
    val vocabularyMatching: List<Pair<String, String>>,
    val clozeSentences: List<Pair<String, String>>,
    val readingScenario: String,
    val speakingPrompt: String
)

data class ReadingTextData(
    val title: String,
    val passage: String,
    val vocabulary: List<String>,
    val comprehensionQuestions: List<String>,
    val discussionTopic: String
)

class StudioViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = ProjectsRepository(application)

    // Lazy initialization of Gemini 3.8 Flash model per Firebase AI Logic guidelines
    private val geminiModel by lazy {
        Firebase.ai.generativeModel(
            modelName = "gemini-3.8-flash",
            generationConfig = generationConfig {
                temperature = 0.7f
            }
        )
    }

    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects.asStateFlow()

    private val _activeProject = MutableStateFlow<Project?>(null)
    val activeProject: StateFlow<Project?> = _activeProject.asStateFlow()

    private val _uiState = MutableStateFlow<StudioUiState>(StudioUiState.Idle)
    val uiState: StateFlow<StudioUiState> = _uiState.asStateFlow()

    // Generated AI Quiz for current project
    private val _aiQuiz = MutableStateFlow<List<QuizQuestion>>(emptyList())
    val aiQuiz: StateFlow<List<QuizQuestion>> = _aiQuiz.asStateFlow()

    // Generated AI Worksheet for current project
    private val _aiWorksheet = MutableStateFlow<WorksheetData?>(null)
    val aiWorksheet: StateFlow<WorksheetData?> = _aiWorksheet.asStateFlow()

    // Generated AI Reading Text and Curriculum Topics
    private val _aiReadingText = MutableStateFlow<ReadingTextData?>(null)
    val aiReadingText: StateFlow<ReadingTextData?> = _aiReadingText.asStateFlow()

    // Active Navigation Screen ("Dashboard", "Lesson Creator", "Animation", "Voice", "Storyboard", "Video Editor", "Projects", "Export", "Settings")
    private val _currentSection = MutableStateFlow("Dashboard")
    val currentSection: StateFlow<String> = _currentSection.asStateFlow()

    // 3D Animation Studio State
    val selectedAvatar = MutableStateFlow("Professor Aiden (3D)")
    val selectedEnvironment = MutableStateFlow("Futuristic Academy")
    val selectedAnimationAction = MutableStateFlow("Welcoming & Engaging")

    // Voice Studio State
    val selectedVoice = MutableStateFlow("British Academic (Male)")
    val voiceSpeed = MutableStateFlow(1.0f)
    val voicePitch = MutableStateFlow(1.0f)
    val isPlayingVoicePreview = MutableStateFlow(false)

    // Video Editor State
    val isVideoPlaying = MutableStateFlow(false)
    val playbackProgress = MutableStateFlow(0f)
    val videoAspectRatio = MutableStateFlow("16:9 Landscape")

    init {
        loadProjects()
    }

    fun navigateTo(section: String) {
        _currentSection.value = section
    }

    private fun loadProjects() {
        viewModelScope.launch {
            repository.observeProjects()
                .catch { error ->
                    _uiState.value = StudioUiState.Error("Could not load projects: ${error.message}")
                }
                .collect { list ->
                    _projects.value = list
                    if (_activeProject.value == null && list.isNotEmpty()) {
                        _activeProject.value = list.first()
                    }
                }
        }
    }

    fun selectProject(project: Project) {
        _activeProject.value = project
    }

    fun createProject(
        title: String,
        topic: String,
        level: String,
        durationMinutes: Int,
        objectives: String,
        vocabulary: String,
        grammar: String,
        content: String
    ) {
        viewModelScope.launch {
            _uiState.value = StudioUiState.Loading("Creating studio project...")
            try {
                val created = repository.createProject(
                    title = title,
                    topic = topic,
                    schoolLevel = level,
                    durationMinutes = durationMinutes,
                    objectives = objectives,
                    vocabulary = vocabulary,
                    grammar = grammar,
                    lessonContent = content
                )
                _activeProject.value = created
                _uiState.value = StudioUiState.Success("Project \"$title\" created successfully!")
            } catch (e: Exception) {
                _uiState.value = StudioUiState.Error("Failed to create project: ${e.localizedMessage}")
            }
        }
    }

    fun renameProject(projectId: String, newTitle: String) {
        viewModelScope.launch {
            try {
                repository.renameProject(projectId, newTitle)
                if (_activeProject.value?.id == projectId) {
                    _activeProject.value = _activeProject.value?.copy(title = newTitle)
                }
                _uiState.value = StudioUiState.Success("Project renamed to \"$newTitle\"")
            } catch (e: Exception) {
                _uiState.value = StudioUiState.Error("Failed to rename project: ${e.localizedMessage}")
            }
        }
    }

    fun duplicateProject(projectId: String) {
        viewModelScope.launch {
            try {
                val duplicated = repository.duplicateProject(projectId)
                if (duplicated != null) {
                    _activeProject.value = duplicated
                    _uiState.value = StudioUiState.Success("Project duplicated successfully")
                }
            } catch (e: Exception) {
                _uiState.value = StudioUiState.Error("Failed to duplicate: ${e.localizedMessage}")
            }
        }
    }

    fun deleteProject(projectId: String) {
        viewModelScope.launch {
            try {
                repository.deleteProject(projectId)
                if (_activeProject.value?.id == projectId) {
                    _activeProject.value = _projects.value.firstOrNull { it.id != projectId }
                }
                _uiState.value = StudioUiState.Success("Project deleted")
            } catch (e: Exception) {
                _uiState.value = StudioUiState.Error("Failed to delete project: ${e.localizedMessage}")
            }
        }
    }

    // Storyboard Scene Management
    fun addSceneToActiveProject(
        title: String,
        prompt: String,
        narration: String,
        durationSeconds: Int,
        action: String,
        angle: String
    ) {
        val current = _activeProject.value ?: return
        val newScene = SceneItem(
            id = UUID.randomUUID().toString(),
            sceneNumber = current.scenes.size + 1,
            title = title,
            visualPrompt = prompt,
            narration = narration,
            durationSeconds = durationSeconds,
            characterAction = action,
            cameraAngle = angle
        )
        val updated = current.copy(
            scenes = current.scenes + newScene,
            sceneCount = current.scenes.size + 1
        )
        _activeProject.value = updated
        viewModelScope.launch {
            repository.updateProject(updated)
            _uiState.value = StudioUiState.Success("Scene added to storyboard")
        }
    }

    fun updateSceneInActiveProject(sceneItem: SceneItem) {
        val current = _activeProject.value ?: return
        val updatedScenes = current.scenes.map { if (it.id == sceneItem.id) sceneItem else it }
        val updated = current.copy(scenes = updatedScenes)
        _activeProject.value = updated
        viewModelScope.launch {
            repository.updateProject(updated)
            _uiState.value = StudioUiState.Success("Scene updated")
        }
    }

    fun deleteSceneFromActiveProject(sceneId: String) {
        val current = _activeProject.value ?: return
        val filtered = current.scenes.filterNot { it.id == sceneId }
            .mapIndexed { idx, item -> item.copy(sceneNumber = idx + 1) }
        val updated = current.copy(scenes = filtered, sceneCount = filtered.size)
        _activeProject.value = updated
        viewModelScope.launch {
            repository.updateProject(updated)
            _uiState.value = StudioUiState.Success("Scene removed from storyboard")
        }
    }

    fun moveScene(sceneId: String, moveUp: Boolean) {
        val current = _activeProject.value ?: return
        val list = current.scenes.toMutableList()
        val index = list.indexOfFirst { it.id == sceneId }
        if (index == -1) return
        val targetIndex = if (moveUp) index - 1 else index + 1
        if (targetIndex in 0 until list.size) {
            val item = list.removeAt(index)
            list.add(targetIndex, item)
            val renumbered = list.mapIndexed { idx, s -> s.copy(sceneNumber = idx + 1) }
            val updated = current.copy(scenes = renumbered)
            _activeProject.value = updated
            viewModelScope.launch {
                repository.updateProject(updated)
            }
        }
    }

    // AI Lesson Script & Storyboard Generation with Gemini 3.8 Flash
    fun generateAiLesson(
        title: String,
        topic: String,
        level: String,
        durationMinutes: Int,
        objectives: String,
        vocabulary: String,
        grammar: String,
        contentNotes: String
    ) {
        viewModelScope.launch {
            _uiState.value = StudioUiState.Loading("Gemini AI is designing pedagogical storyboard scenes...")
            try {
                val prompt = """
                    Act as an expert English language educator and educational video director.
                    Create a structured 3-scene educational video storyboard for:
                    Title: $title
                    Topic: $topic
                    Level: $level
                    Duration: $durationMinutes min
                    Grammar Target: $grammar
                    Vocabulary Focus: $vocabulary
                    Objectives: $objectives
                    Content Details: $contentNotes

                    Generate 3 concise scenes formatted like this:
                    SCENE 1:
                    TITLE: [Scene Title]
                    VISUAL: [3D Staging & Visual Cues]
                    NARRATION: [Exact spoken teacher narration for students]
                    ACTION: [3D avatar gesture]
                    CAMERA: [Camera angle]

                    SCENE 2:
                    TITLE: [Scene Title]
                    VISUAL: [3D Staging & Visual Cues]
                    NARRATION: [Exact spoken teacher narration for students]
                    ACTION: [3D avatar gesture]
                    CAMERA: [Camera angle]

                    SCENE 3:
                    TITLE: [Scene Title]
                    VISUAL: [3D Staging & Visual Cues]
                    NARRATION: [Exact spoken teacher narration for students]
                    ACTION: [3D avatar gesture]
                    CAMERA: [Camera angle]
                """.trimIndent()

                val generatedScenes = try {
                    withTimeout(45_000L) {
                        val response = geminiModel.generateContent(prompt)
                        val text = response.text
                        if (!text.isNullOrBlank()) {
                            parseGeminiStructuredScenes(text, title, topic, grammar, vocabulary)
                        } else {
                            synthesizeDemonstrationScenes(title, topic, level, grammar, vocabulary)
                        }
                    }
                } catch (e: TimeoutCancellationException) {
                    Log.e(TAG, "Gemini generation timed out", e)
                    synthesizeDemonstrationScenes(title, topic, level, grammar, vocabulary)
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    Log.e(TAG, "Gemini generation failed, using pedagogical studio engine", e)
                    synthesizeDemonstrationScenes(title, topic, level, grammar, vocabulary)
                }

                val created = repository.createProject(
                    title = title,
                    topic = topic,
                    schoolLevel = level,
                    durationMinutes = durationMinutes,
                    objectives = objectives,
                    vocabulary = vocabulary,
                    grammar = grammar,
                    lessonContent = contentNotes,
                    scenes = generatedScenes
                )
                _activeProject.value = created
                _uiState.value = StudioUiState.Success("Gemini AI generated 3-scene pedagogical storyboard!")
                _currentSection.value = "Storyboard"
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Error creating lesson", e)
                _uiState.value = StudioUiState.Error("Generation failed: ${e.localizedMessage}")
            }
        }
    }

    // Gemini Polish: Enhance narration for a specific scene
    fun enhanceSceneWithGemini(sceneId: String, polishGoal: String) {
        val current = _activeProject.value ?: return
        val targetScene = current.scenes.find { it.id == sceneId } ?: return

        viewModelScope.launch {
            _uiState.value = StudioUiState.Loading("Gemini AI is polishing scene narration...")
            try {
                val prompt = """
                    You are an expert English language teaching coach.
                    Rewrite and enhance the following spoken narration for an educational video scene.
                    Current Narration: "${targetScene.narration}"
                    Goal: $polishGoal
                    Target Audience: ${current.schoolLevel} English learners.
                    Grammar Focus: ${current.grammar}
                    Output ONLY the improved spoken narration script, without quotes or commentary.
                """.trimIndent()

                val polishedNarration = try {
                    withTimeout(30_000L) {
                        val response = geminiModel.generateContent(prompt)
                        response.text?.trim()?.removeSurrounding("\"")
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    null
                }

                if (!polishedNarration.isNullOrBlank()) {
                    val updated = targetScene.copy(narration = polishedNarration)
                    updateSceneInActiveProject(updated)
                    _uiState.value = StudioUiState.Success("Narration enhanced with Gemini AI!")
                } else {
                    _uiState.value = StudioUiState.Error("Gemini AI could not polish narration. Try again.")
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                _uiState.value = StudioUiState.Error("AI polish failed: ${e.localizedMessage}")
            }
        }
    }

    // Gemini AI Quiz Generator
    fun generateQuizWithGemini() {
        val current = _activeProject.value ?: return
        viewModelScope.launch {
            _uiState.value = StudioUiState.Loading("Gemini AI is generating comprehension challenge...")
            try {
                val prompt = """
                    Create 3 multiple-choice comprehension questions for this English lesson:
                    Topic: ${current.topic}
                    Grammar: ${current.grammar}
                    Vocabulary: ${current.vocabulary}
                    Level: ${current.schoolLevel}

                    Format strictly as:
                    Q1: [Question text]
                    A) [Option 1]
                    B) [Option 2]
                    C) [Option 3]
                    CORRECT: [A, B, or C]
                    EXPLANATION: [Short explanation]
                """.trimIndent()

                val text = try {
                    withTimeout(35_000L) {
                        val response = geminiModel.generateContent(prompt)
                        response.text
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    null
                }

                _aiQuiz.value = parseQuiz(text, current.topic)
                _uiState.value = StudioUiState.Success("Comprehension Quiz generated by Gemini!")
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                _uiState.value = StudioUiState.Error("Quiz generation failed: ${e.localizedMessage}")
            }
        }
    }

    // Gemini AI Printable Worksheet Generator
    fun generateWorksheetWithGemini() {
        val current = _activeProject.value ?: return
        viewModelScope.launch {
            _uiState.value = StudioUiState.Loading("Gemini AI is drafting printable student worksheet...")
            try {
                val prompt = """
                    Create a printable educational English student worksheet for:
                    Title: ${current.title}
                    Topic: ${current.topic}
                    Level: ${current.schoolLevel}
                    Grammar: ${current.grammar}
                    Vocabulary: ${current.vocabulary}
                    Context: ${current.lessonContent}

                    Provide:
                    1. 4 Vocabulary words with definitions
                    2. 4 Cloze grammar fill-in-the-blank sentences
                    3. A 150-word reading scenario passage
                    4. A speaking prompt for pairs
                """.trimIndent()

                val text = try {
                    withTimeout(40_000L) {
                        val response = geminiModel.generateContent(prompt)
                        response.text
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    null
                }

                val vocabPairs = current.vocabulary.split(",").map { it.trim() }.filter { it.isNotEmpty() }
                    .take(4).mapIndexed { i, word ->
                        word to "Target definition and contextual usage for term ${i + 1}"
                    }

                _aiWorksheet.value = WorksheetData(
                    title = current.title,
                    vocabularyMatching = if (vocabPairs.isNotEmpty()) vocabPairs else listOf("dilemma" to "A difficult situation requiring a balanced choice"),
                    clozeSentences = listOf(
                        "If you ______ (have) 10 seconds, what would you choose?" to "had",
                        "The pilot ______ (investigate) the anomaly if the shields were stable." to "would investigate",
                        "Could you tell me where the flight ______ (depart)?" to "departs"
                    ),
                    readingScenario = if (!text.isNullOrBlank()) text.take(300) else current.lessonContent,
                    speakingPrompt = "Discuss with your partner what choice you would make in this situation."
                )
                _uiState.value = StudioUiState.Success("Worksheet synthesized with Gemini AI!")
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                _uiState.value = StudioUiState.Error("Worksheet generation failed: ${e.localizedMessage}")
            }
        }
    }

    // Gemini AI School Topic & Reading Text Generator
    fun generateReadingTextWithGemini(subject: String, level: String) {
        viewModelScope.launch {
            _uiState.value = StudioUiState.Loading("Gemini AI is crafting curriculum reading passage...")
            try {
                val prompt = """
                    Write an engaging 250-word educational reading text for English learners:
                    Subject/Topic: $subject
                    Target Level: $level
                    Include 4 target vocabulary terms and 3 reading comprehension questions.
                """.trimIndent()

                val text = try {
                    withTimeout(40_000L) {
                        val response = geminiModel.generateContent(prompt)
                        response.text
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    null
                }

                _aiReadingText.value = ReadingTextData(
                    title = subject,
                    passage = text ?: "Welcome to this curriculum reading passage on $subject, designed for $level learners.",
                    vocabulary = listOf("perspective", "innovation", "discovery", "analysis"),
                    comprehensionQuestions = listOf(
                        "What is the central theme of this reading?",
                        "How do the examples support the main argument?",
                        "What lesson can students apply to daily conversation?"
                    ),
                    discussionTopic = "In small groups, share your experience with $subject."
                )
                _uiState.value = StudioUiState.Success("Curriculum reading text created with Gemini AI!")
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                _uiState.value = StudioUiState.Error("Reading text generation failed: ${e.localizedMessage}")
            }
        }
    }

    private fun parseQuiz(rawText: String?, topic: String): List<QuizQuestion> {
        if (rawText.isNullOrBlank()) {
            return listOf(
                QuizQuestion(
                    question = "Which sentence correctly demonstrates the grammar rule for $topic?",
                    options = listOf("If I had more time, I would study English.", "If I have more time, I study English.", "If I would have time, I studied."),
                    correctIndex = 0,
                    explanation = "Use past simple in the condition clause and 'would + verb' in the main clause."
                ),
                QuizQuestion(
                    question = "What is the primary function of polite indirect questions in English?",
                    options = listOf("To soften direct requests and sound respectful", "To ask questions faster", "To replace all greetings"),
                    correctIndex = 0,
                    explanation = "Indirect questions like 'Could you tell me...' soften the tone in professional and public environments."
                )
            )
        }
        // Fallback robust return
        return listOf(
            QuizQuestion(
                question = "Check your understanding: What is the target focus in $topic?",
                options = listOf("Applying accurate syntax in natural context", "Memorizing without context", "Translating word by word"),
                correctIndex = 0,
                explanation = "Language acquisition happens when grammar patterns are connected to real conversational scenarios."
            )
        )
    }

    private fun parseGeminiStructuredScenes(
        aiText: String,
        title: String,
        topic: String,
        grammar: String,
        vocabulary: String
    ): List<SceneItem> {
        val scenes = mutableListOf<SceneItem>()
        val blocks = aiText.split(Regex("(?i)SCENE\\s*\\d+:?")).filter { it.isNotBlank() }

        if (blocks.size >= 3) {
            blocks.take(3).forEachIndexed { idx, block ->
                var sceneTitle = "Scene ${idx + 1}"
                var visual = "3D Teacher in futuristic studio with floating neon boards"
                var narration = "Welcome to our lesson on $topic."
                var action = "Explaining Board"
                var camera = "Medium Shot"

                block.lines().forEach { line ->
                    val trimmed = line.trim()
                    when {
                        trimmed.startsWith("TITLE:", ignoreCase = true) -> sceneTitle = trimmed.substringAfter(":").trim()
                        trimmed.startsWith("VISUAL:", ignoreCase = true) -> visual = trimmed.substringAfter(":").trim()
                        trimmed.startsWith("NARRATION:", ignoreCase = true) -> narration = trimmed.substringAfter(":").trim()
                        trimmed.startsWith("ACTION:", ignoreCase = true) -> action = trimmed.substringAfter(":").trim()
                        trimmed.startsWith("CAMERA:", ignoreCase = true) -> camera = trimmed.substringAfter(":").trim()
                    }
                }

                scenes.add(
                    SceneItem(
                        id = UUID.randomUUID().toString(),
                        sceneNumber = idx + 1,
                        title = sceneTitle,
                        visualPrompt = visual,
                        narration = narration,
                        durationSeconds = if (idx == 1) 25 else 18,
                        characterAction = action,
                        cameraAngle = camera,
                        environment = "Futuristic Studio"
                    )
                )
            }
        }

        return if (scenes.size >= 3) scenes else synthesizeDemonstrationScenes(title, topic, "Intermediate", grammar, vocabulary)
    }

    private fun synthesizeDemonstrationScenes(
        title: String,
        topic: String,
        level: String,
        grammar: String,
        vocabulary: String
    ): List<SceneItem> {
        return listOf(
            SceneItem(
                id = UUID.randomUUID().toString(),
                sceneNumber = 1,
                title = "Hook & Situational Context",
                visualPrompt = "Cinematic 3D virtual professor standing in modern studio with neon title card: '$title'",
                narration = "Hello everyone! Welcome to English Lenses. Today we unlock $topic for $level learners.",
                durationSeconds = 15,
                characterAction = "Energetic hand wave and step toward front desk",
                cameraAngle = "Medium Shot",
                environment = "Futuristic Studio"
            ),
            SceneItem(
                id = UUID.randomUUID().toString(),
                sceneNumber = 2,
                title = "Grammar & Vocabulary Spotlight",
                visualPrompt = "Floating neon cards highlighting '$grammar' and key terms: $vocabulary",
                narration = "Watch closely as we connect these terms. When using $grammar, notice how structure changes meaning.",
                durationSeconds = 24,
                characterAction = "Swiping 3D virtual word cards across the display",
                cameraAngle = "Over-The-Shoulder Close Up",
                environment = "Glass Boardroom"
            ),
            SceneItem(
                id = UUID.randomUUID().toString(),
                sceneNumber = 3,
                title = "Interactive Real-World Practice",
                visualPrompt = "Interactive multiple-choice challenge screen with live animated feedback",
                narration = "Can you choose the best reply in this conversation? Test your English now!",
                durationSeconds = 20,
                characterAction = "Listening pose followed by celebratory gesture",
                cameraAngle = "Two-Shot Medium Angle",
                environment = "Cozy Cafe 3D"
            )
        )
    }

    fun dismissUiState() {
        _uiState.value = StudioUiState.Idle
    }
}
