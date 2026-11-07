package com.example.data

import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp

data class SceneItem(
    val id: String = "",
    val sceneNumber: Int = 1,
    val title: String = "",
    val visualPrompt: String = "",
    val narration: String = "",
    val durationSeconds: Int = 12,
    val characterAction: String = "Speaking to camera",
    val cameraAngle: String = "Medium Shot",
    val environment: String = "Modern Studio"
)

data class Project(
    @DocumentId val id: String = "",
    val userId: String = "",
    val title: String = "New English Lesson",
    val topic: String = "Daily Conversation & Grammar",
    val schoolLevel: String = "Intermediate (B1)",
    val durationMinutes: Int = 3,
    val objectives: String = "Improve conversational fluency and understand conditional structures.",
    val vocabulary: String = "hypothetical, consequence, dilemma, scenario",
    val grammar: String = "Second Conditional (If + Past Simple, would + base verb)",
    val lessonContent: String = "In this interactive lesson, learners explore what they would do in unexpected scenarios.",
    val status: String = "Ready", // "Draft", "Ready", "In Production", "Exported"
    val sceneCount: Int = 3,
    val scenes: List<SceneItem> = emptyList(),
    @ServerTimestamp val createdAt: Timestamp? = null,
    @ServerTimestamp val updatedAt: Timestamp? = null
)
