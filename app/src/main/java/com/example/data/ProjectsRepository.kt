package com.example.data

import android.content.Context
import com.example.R
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.snapshots
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await
import java.util.UUID

class ProjectsRepository(private val db: FirebaseFirestore? = null) {

    constructor(context: Context) : this(
        try {
            val dbId = context.applicationContext.getString(R.string.firestore_database_id)
            if (dbId.isNotBlank()) FirebaseFirestore.getInstance(dbId) else null
        } catch (_: Exception) {
            null
        }
    )

    private val auth get() = try {
        Firebase.auth
    } catch (_: Exception) {
        null
    }

    // Local in-memory fallback list with professional initial templates
    private val _localProjects = MutableStateFlow<List<Project>>(createInitialDemoProjects())
    val localProjects: Flow<List<Project>> = _localProjects.asStateFlow()

    private fun currentUserId(): String {
        return auth?.currentUser?.uid ?: "local_studio_creator"
    }

    fun observeProjects(): Flow<List<Project>> = flow {
        val uid = auth?.currentUser?.uid
        if (db != null && uid != null) {
            try {
                emitAll(
                    db.collection("users").document(uid).collection("projects")
                        .snapshots()
                        .map { snapshot ->
                            val list = snapshot.toObjects(Project::class.java)
                            if (list.isEmpty() && _localProjects.value.isNotEmpty()) {
                                _localProjects.value
                            } else {
                                list
                            }
                        }
                        .catch { error ->
                            if (error is CancellationException) throw error
                            // Fallback to local memory on Firestore error/network issue
                            emit(_localProjects.value)
                        }
                )
                return@flow
            } catch (e: Exception) {
                if (e is CancellationException) throw e
            }
        }
        // Fallback for offline or local preview
        emitAll(_localProjects)
    }

    suspend fun createProject(
        title: String,
        topic: String = "English Grammar & Speaking",
        schoolLevel: String = "Intermediate (B1)",
        durationMinutes: Int = 3,
        objectives: String = "Improve conversational fluency and sentence structures.",
        vocabulary: String = "key words, phrases, idioms",
        grammar: String = "Present Perfect vs Past Simple",
        lessonContent: String = "Lesson overview content",
        scenes: List<SceneItem> = emptyList()
    ): Project {
        val newId = UUID.randomUUID().toString()
        val generatedScenes = if (scenes.isEmpty()) {
            listOf(
                SceneItem(
                    id = UUID.randomUUID().toString(),
                    sceneNumber = 1,
                    title = "Hook & Introduction",
                    visualPrompt = "3D Teacher in futuristic studio with floating neon title cards: $title",
                    narration = "Welcome class! Today we explore $topic. Notice how these sentences connect.",
                    durationSeconds = 15,
                    characterAction = "Warm greeting and gesture towards floating board",
                    cameraAngle = "Medium Close-Up"
                ),
                SceneItem(
                    id = UUID.randomUUID().toString(),
                    sceneNumber = 2,
                    title = "Grammar Spotlight & Examples",
                    visualPrompt = "Interactive holographic breakdown of $grammar with color-coded syntax",
                    narration = "Here is the key rule: notice the structure in action with our first example.",
                    durationSeconds = 25,
                    characterAction = "Pointing and highlighting dynamic text",
                    cameraAngle = "Wide Two-Shot"
                ),
                SceneItem(
                    id = UUID.randomUUID().toString(),
                    sceneNumber = 3,
                    title = "Interactive Challenge & Wrap-up",
                    visualPrompt = "Dynamic multiple choice challenge question on virtual display screen",
                    narration = "Can you spot the correct verb form in this sentence? Excellent work today!",
                    durationSeconds = 20,
                    characterAction = "Encouraging thumbs up with celebratory motion graphics",
                    cameraAngle = "Medium Shot"
                )
            )
        } else scenes

        val project = Project(
            id = newId,
            userId = currentUserId(),
            title = title,
            topic = topic,
            schoolLevel = schoolLevel,
            durationMinutes = durationMinutes,
            objectives = objectives,
            vocabulary = vocabulary,
            grammar = grammar,
            lessonContent = lessonContent,
            status = "Ready",
            sceneCount = generatedScenes.size,
            scenes = generatedScenes
        )

        // Update local memory immediately
        _localProjects.value = listOf(project) + _localProjects.value

        // Try syncing to Firestore
        val uid = auth?.currentUser?.uid
        if (db != null && uid != null) {
            try {
                val docRef = db.collection("users").document(uid).collection("projects").document(newId)
                val scenesMap = project.scenes.map { scene ->
                    mapOf(
                        "id" to scene.id,
                        "sceneNumber" to scene.sceneNumber,
                        "title" to scene.title,
                        "visualPrompt" to scene.visualPrompt,
                        "narration" to scene.narration,
                        "durationSeconds" to scene.durationSeconds,
                        "characterAction" to scene.characterAction,
                        "cameraAngle" to scene.cameraAngle,
                        "environment" to scene.environment
                    )
                }
                val payload = mapOf(
                    "userId" to uid,
                    "title" to project.title,
                    "topic" to project.topic,
                    "schoolLevel" to project.schoolLevel,
                    "durationMinutes" to project.durationMinutes,
                    "objectives" to project.objectives,
                    "vocabulary" to project.vocabulary,
                    "grammar" to project.grammar,
                    "lessonContent" to project.lessonContent,
                    "status" to project.status,
                    "sceneCount" to project.sceneCount,
                    "scenes" to scenesMap,
                    "createdAt" to FieldValue.serverTimestamp(),
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                docRef.set(payload).await()
            } catch (_: Exception) {}
        }

        return project
    }

    suspend fun updateProject(project: Project) {
        _localProjects.value = _localProjects.value.map {
            if (it.id == project.id) project else it
        }

        val uid = auth?.currentUser?.uid
        if (db != null && uid != null && project.id.isNotBlank()) {
            try {
                val docRef = db.collection("users").document(uid).collection("projects").document(project.id)
                val scenesMap = project.scenes.map { scene ->
                    mapOf(
                        "id" to scene.id,
                        "sceneNumber" to scene.sceneNumber,
                        "title" to scene.title,
                        "visualPrompt" to scene.visualPrompt,
                        "narration" to scene.narration,
                        "durationSeconds" to scene.durationSeconds,
                        "characterAction" to scene.characterAction,
                        "cameraAngle" to scene.cameraAngle,
                        "environment" to scene.environment
                    )
                }
                val payload = mapOf(
                    "title" to project.title,
                    "topic" to project.topic,
                    "schoolLevel" to project.schoolLevel,
                    "durationMinutes" to project.durationMinutes,
                    "objectives" to project.objectives,
                    "vocabulary" to project.vocabulary,
                    "grammar" to project.grammar,
                    "lessonContent" to project.lessonContent,
                    "status" to project.status,
                    "sceneCount" to project.scenes.size,
                    "scenes" to scenesMap,
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                docRef.update(payload).await()
            } catch (_: Exception) {}
        }
    }

    suspend fun renameProject(projectId: String, newTitle: String) {
        val current = _localProjects.value.find { it.id == projectId }
        if (current != null) {
            updateProject(current.copy(title = newTitle))
        }
    }

    suspend fun duplicateProject(projectId: String): Project? {
        val current = _localProjects.value.find { it.id == projectId } ?: return null
        val copy = current.copy(
            id = UUID.randomUUID().toString(),
            title = "${current.title} (Copy)"
        )
        _localProjects.value = listOf(copy) + _localProjects.value
        return copy
    }

    suspend fun deleteProject(projectId: String) {
        _localProjects.value = _localProjects.value.filterNot { it.id == projectId }

        val uid = auth?.currentUser?.uid
        if (db != null && uid != null && projectId.isNotBlank()) {
            try {
                db.collection("users").document(uid).collection("projects").document(projectId).delete().await()
            } catch (_: Exception) {}
        }
    }

    private fun createInitialDemoProjects(): List<Project> {
        return listOf(
            Project(
                id = "demo_project_1",
                userId = "studio_demo",
                title = "Mastering Conditionals in 3D Space",
                topic = "Hypothetical Situations & Second Conditional",
                schoolLevel = "Upper-Intermediate (B2)",
                durationMinutes = 4,
                objectives = "Master the if + past simple, would + infinitive structure using visual sci-fi dilemmas.",
                vocabulary = "hypothetical, time dilation, paradox, alternate reality",
                grammar = "Second & Third Conditionals",
                lessonContent = "Students follow Captain Sarah aboard the starship Prometheus making critical decisions under hypothetical dilemmas.",
                status = "Ready",
                sceneCount = 4,
                scenes = listOf(
                    SceneItem(
                        id = "scene_1_1",
                        sceneNumber = 1,
                        title = "Mission Briefing - The Dilemma",
                        visualPrompt = "Starship bridge at warp speed with Captain Sarah pointing at anomalous temporal rift",
                        narration = "If you had 10 seconds to save your crew or investigate the rift, what would you do?",
                        durationSeconds = 18,
                        characterAction = "Heroic pose at helm console with urgent gaze",
                        cameraAngle = "Low-Angle Medium Shot",
                        environment = "Sci-Fi Bridge"
                    ),
                    SceneItem(
                        id = "scene_1_2",
                        sceneNumber = 2,
                        title = "Grammar Engine - Breaking Down 'If + Would'",
                        visualPrompt = "Holographic quantum reactor displaying sentence formulas in glowing blue lasers",
                        narration = "Notice the verb tense: 'If I found a new planet, I would name it Aurora.' Past simple for condition, would for result.",
                        durationSeconds = 24,
                        characterAction = "Manipulating 3D sentence blocks with pinch gestures",
                        cameraAngle = "Close-Up Over Shoulder",
                        environment = "Holographic Lab"
                    ),
                    SceneItem(
                        id = "scene_1_3",
                        sceneNumber = 3,
                        title = "Interactive Choice Simulator",
                        visualPrompt = "Split holographic screen showing Option A vs Option B with live polling animation",
                        narration = "Now complete Sarah's transmission: 'If we ______ (have) enough fuel, we would return.' Choose your answer!",
                        durationSeconds = 20,
                        characterAction = "Waiting eagerly with raised eyebrow and interactive buzzer",
                        cameraAngle = "Dutch Angle",
                        environment = "Command Hub"
                    ),
                    SceneItem(
                        id = "scene_1_4",
                        sceneNumber = 4,
                        title = "Outro & Key Takeaways",
                        visualPrompt = "Starship entering hyperspace with neon mission summary badge",
                        narration = "Fantastic work pilots! Remember, unreal scenarios always pair with 'would'. See you in the next lesson!",
                        durationSeconds = 16,
                        characterAction = "Salute and wave as ship jumps to lightspeed",
                        cameraAngle = "Cinematic Wide Pull-Back",
                        environment = "Deep Cosmos"
                    )
                )
            ),
            Project(
                id = "demo_project_2",
                userId = "studio_demo",
                title = "Job Interview Mastery: Phrasal Verbs",
                topic = "Professional Business English",
                schoolLevel = "Intermediate (B1)",
                durationMinutes = 3,
                objectives = "Confidently incorporate phrasal verbs like 'bring up', 'carry out', and 'follow up' in professional interviews.",
                vocabulary = "bring up, follow up, carry out, take on, wrap up",
                grammar = "Phrasal Verbs with Objects (Separable vs Inseparable)",
                lessonContent = "An interactive interview roleplay set in a modern high-rise tech studio.",
                status = "In Production",
                sceneCount = 3,
                scenes = listOf(
                    SceneItem(
                        id = "scene_2_1",
                        sceneNumber = 1,
                        title = "Entering the Boardroom",
                        visualPrompt = "Sleek glass boardroom overlooking London skyline with interviewer smiling",
                        narration = "Welcome to the interview studio. Today we master verbs that impress global hiring managers.",
                        durationSeconds = 15,
                        characterAction = "Firm handshake and sitting at conference table",
                        cameraAngle = "Eye-Level Medium Shot",
                        environment = "Glass Boardroom"
                    ),
                    SceneItem(
                        id = "scene_2_2",
                        sceneNumber = 2,
                        title = "Case Study: Leading a Project",
                        visualPrompt = "Smartboard popping up with charts: 'We carried out a multi-national audit.'",
                        narration = "Instead of saying 'I did the project', say 'I carried out the project' or 'I took on the responsibility'.",
                        durationSeconds = 25,
                        characterAction = "Presenting metrics with confident hand gestures",
                        cameraAngle = "Medium Shot",
                        environment = "Glass Boardroom"
                    ),
                    SceneItem(
                        id = "scene_2_3",
                        sceneNumber = 3,
                        title = "Follow-up Strategy",
                        visualPrompt = "Digital email animation highlighting polite follow-up template",
                        narration = "Always send a note to follow up after the discussion. Practice making your sentence now!",
                        durationSeconds = 18,
                        characterAction = "Nodding approvingly and reviewing notes",
                        cameraAngle = "Close-Up",
                        environment = "Office Lounge"
                    )
                )
            )
        )
    }
}
