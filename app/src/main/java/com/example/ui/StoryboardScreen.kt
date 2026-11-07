package com.example.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SceneItem
import com.example.ui.theme.*

@Composable
fun StoryboardScreen(
    viewModel: StudioViewModel,
    onNavigateToVideoEditor: () -> Unit
) {
    val activeProject by viewModel.activeProject.collectAsState()
    val aiQuiz by viewModel.aiQuiz.collectAsState()

    var showAddSceneDialog by remember { mutableStateOf(false) }
    var sceneToEdit by remember { mutableStateOf<SceneItem?>(null) }
    var sceneToDelete by remember { mutableStateOf<SceneItem?>(null) }
    var sceneToPolishWithGemini by remember { mutableStateOf<SceneItem?>(null) }

    val scenes = activeProject?.scenes ?: emptyList()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioBackground)
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Storyboard Editor",
                        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
                    )
                    Text(
                        text = "Project: ${activeProject?.title ?: "Select a project"} (${scenes.size} Scenes)",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { viewModel.generateQuizWithGemini() },
                        colors = ButtonDefaults.buttonColors(containerColor = StudioPurpleDark),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Psychology, contentDescription = "AI Quiz", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("AI Quiz", fontSize = 12.sp)
                    }

                    Button(
                        onClick = { showAddSceneDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Add Scene")
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Scene")
                    }

                    OutlinedButton(
                        onClick = onNavigateToVideoEditor,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = StudioBlueAccent),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Preview Video")
                    }
                }
            }
        }

        // Gemini AI Quiz Card if generated
        if (aiQuiz.isNotEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1B4B)),
                    shape = RoundedCornerShape(12.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = Brush.horizontalGradient(listOf(StudioPurplePrimary, StudioBlueAccent)))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = StudioBlueAccent, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Gemini AI Comprehension Quiz", style = MaterialTheme.typography.titleMedium.copy(color = Color.White, fontWeight = FontWeight.Bold))
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        aiQuiz.forEachIndexed { qIdx, q ->
                            Text("${qIdx + 1}. ${q.question}", style = MaterialTheme.typography.bodyMedium.copy(color = Color.White, fontWeight = FontWeight.Bold))
                            q.options.forEach { opt ->
                                Text("   • $opt", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                            }
                            Text("Answer: ${q.explanation}", style = MaterialTheme.typography.labelSmall.copy(color = StudioGreen))
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                }
            }
        }

        if (scenes.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = StudioSurface),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.AutoStories, contentDescription = null, tint = StudioPurpleLight, modifier = Modifier.size(48.dp))
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("No Scenes in Storyboard", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary))
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Add your first shot or generate a lesson script automatically with the AI Lesson Creator.", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { showAddSceneDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary)
                        ) {
                            Text("Create Scene 1")
                        }
                    }
                }
            }
        } else {
            itemsIndexed(scenes, key = { _, s -> s.id }) { index, scene ->
                SceneCardItem(
                    scene = scene,
                    isFirst = index == 0,
                    isLast = index == scenes.lastIndex,
                    onEdit = { sceneToEdit = scene },
                    onPolishWithGemini = { sceneToPolishWithGemini = scene },
                    onMoveUp = { viewModel.moveScene(scene.id, moveUp = true) },
                    onMoveDown = { viewModel.moveScene(scene.id, moveUp = false) },
                    onDuplicate = {
                        viewModel.addSceneToActiveProject(
                            title = "${scene.title} (Copy)",
                            prompt = scene.visualPrompt,
                            narration = scene.narration,
                            durationSeconds = scene.durationSeconds,
                            action = scene.characterAction,
                            angle = scene.cameraAngle
                        )
                    },
                    onDelete = { sceneToDelete = scene }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }

    // Dialog: Add Scene
    if (showAddSceneDialog) {
        SceneEditorDialog(
            titleDialog = "Add Storyboard Scene",
            initialTitle = "Scene ${scenes.size + 1}: Key Concept",
            initialPrompt = "3D Teacher gesturing towards interactive English sentence diagram",
            initialNarration = "Notice how this word functions in context.",
            initialDuration = 15,
            initialAction = "Explaining Board",
            initialAngle = "Medium Shot",
            onDismiss = { showAddSceneDialog = false },
            onSave = { t, p, n, d, a, ang ->
                viewModel.addSceneToActiveProject(t, p, n, d, a, ang)
                showAddSceneDialog = false
            }
        )
    }

    // Dialog: Edit Scene
    if (sceneToEdit != null) {
        val s = sceneToEdit!!
        SceneEditorDialog(
            titleDialog = "Edit Scene ${s.sceneNumber}",
            initialTitle = s.title,
            initialPrompt = s.visualPrompt,
            initialNarration = s.narration,
            initialDuration = s.durationSeconds,
            initialAction = s.characterAction,
            initialAngle = s.cameraAngle,
            onDismiss = { sceneToEdit = null },
            onSave = { t, p, n, d, a, ang ->
                viewModel.updateSceneInActiveProject(
                    s.copy(
                        title = t,
                        visualPrompt = p,
                        narration = n,
                        durationSeconds = d,
                        characterAction = a,
                        cameraAngle = ang
                    )
                )
                sceneToEdit = null
            }
        )
    }

    // Dialog: Polish Scene Narration with Gemini AI
    if (sceneToPolishWithGemini != null) {
        val scene = sceneToPolishWithGemini!!
        var selectedGoal by remember { mutableStateOf("Add an interactive comprehension question") }
        val goals = listOf(
            "Add an interactive comprehension question",
            "Make more natural and conversational",
            "Simplify vocabulary for beginner learners",
            "Inject dramatic cinematic energy"
        )

        AlertDialog(
            onDismissRequest = { sceneToPolishWithGemini = null },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = StudioBlueAccent)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Gemini AI Script Polish", color = TextPrimary)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Current Spoken Narration:", style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary))
                    Surface(
                        color = StudioSurfaceVariant,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "\"${scene.narration}\"",
                            style = MaterialTheme.typography.bodySmall.copy(color = Color.White),
                            modifier = Modifier.padding(10.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Select Enhancement Goal:", style = MaterialTheme.typography.labelMedium.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                    goals.forEach { goal ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(6.dp))
                                .clickable { selectedGoal = goal }
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = selectedGoal == goal,
                                onClick = { selectedGoal = goal }
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(goal, style = MaterialTheme.typography.bodySmall.copy(color = TextPrimary))
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.enhanceSceneWithGemini(scene.id, selectedGoal)
                        sceneToPolishWithGemini = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary)
                ) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Polish Script with Gemini")
                }
            },
            dismissButton = {
                TextButton(onClick = { sceneToPolishWithGemini = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = StudioSurface
        )
    }

    // Dialog: Confirm Delete Scene
    if (sceneToDelete != null) {
        AlertDialog(
            onDismissRequest = { sceneToDelete = null },
            title = { Text("Delete Scene?", color = TextPrimary) },
            text = { Text("Are you sure you want to remove Scene ${sceneToDelete!!.sceneNumber} from the storyboard?", color = TextSecondary) },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteSceneFromActiveProject(sceneToDelete!!.id)
                        sceneToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StudioRed)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { sceneToDelete = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = StudioSurface
        )
    }
}

@Composable
private fun SceneCardItem(
    scene: SceneItem,
    isFirst: Boolean,
    isLast: Boolean,
    onEdit: () -> Unit,
    onPolishWithGemini: () -> Unit,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = StudioSurface),
        shape = RoundedCornerShape(14.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.horizontalGradient(listOf(StudioBorder, StudioSurfaceVariant)))
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = StudioPurpleDark,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = "SCENE ${scene.sceneNumber}",
                            style = MaterialTheme.typography.labelMedium.copy(color = Color.White, fontWeight = FontWeight.Bold),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = scene.title,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
                    )
                }

                // Timing & Reorder controls
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = StudioSurfaceVariant,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "${scene.durationSeconds}s",
                            style = MaterialTheme.typography.labelSmall.copy(color = StudioBlueAccent, fontWeight = FontWeight.Bold),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                    IconButton(onClick = onMoveUp, enabled = !isFirst) {
                        Icon(Icons.Default.ArrowUpward, contentDescription = "Move Up", tint = if (isFirst) TextMuted else TextPrimary, modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = onMoveDown, enabled = !isLast) {
                        Icon(Icons.Default.ArrowDownward, contentDescription = "Move Down", tint = if (isLast) TextMuted else TextPrimary, modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Visual Prompt Box
            Surface(
                color = StudioSurfaceVariant,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("3D Visual Prompt & Staging:", style = MaterialTheme.typography.labelSmall.copy(color = StudioBlueAccent, fontWeight = FontWeight.Bold))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(scene.visualPrompt, style = MaterialTheme.typography.bodySmall.copy(color = TextPrimary))
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Narration Box
            Surface(
                color = Color(0xFF161F2E),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Audio Narration / Spoken Script:", style = MaterialTheme.typography.labelSmall.copy(color = StudioPurpleLight, fontWeight = FontWeight.Bold))
                        AssistChip(
                            onClick = onPolishWithGemini,
                            label = { Text("Polish with Gemini", style = MaterialTheme.typography.labelSmall.copy(color = StudioBlueAccent)) },
                            leadingIcon = { Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = StudioBlueAccent, modifier = Modifier.size(14.dp)) }
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("\"${scene.narration}\"", style = MaterialTheme.typography.bodySmall.copy(color = Color.White))
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Metadata Chips: Camera & Action
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(
                    onClick = {},
                    label = { Text("Camera: ${scene.cameraAngle}", style = MaterialTheme.typography.labelSmall) }
                )
                AssistChip(
                    onClick = {},
                    label = { Text("Action: ${scene.characterAction}", style = MaterialTheme.typography.labelSmall) }
                )
            }

            Spacer(modifier = Modifier.height(10.dp))
            Divider(color = StudioBorder)
            Spacer(modifier = Modifier.height(6.dp))

            // Scene Card Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onPolishWithGemini) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = "AI Polish", tint = StudioBlueAccent, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("AI Polish", color = StudioBlueAccent)
                }
                TextButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Edit Scene")
                }
                TextButton(onClick = onDuplicate) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Duplicate", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Duplicate")
                }
                TextButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = StudioRed, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete", color = StudioRed)
                }
            }
        }
    }
}

@Composable
private fun SceneEditorDialog(
    titleDialog: String,
    initialTitle: String,
    initialPrompt: String,
    initialNarration: String,
    initialDuration: Int,
    initialAction: String,
    initialAngle: String,
    onDismiss: () -> Unit,
    onSave: (title: String, prompt: String, narration: String, duration: Int, action: String, angle: String) -> Unit
) {
    var title by remember { mutableStateOf(initialTitle) }
    var prompt by remember { mutableStateOf(initialPrompt) }
    var narration by remember { mutableStateOf(initialNarration) }
    var duration by remember { mutableStateOf(initialDuration.toString()) }
    var action by remember { mutableStateOf(initialAction) }
    var angle by remember { mutableStateOf(initialAngle) }

    val angles = listOf("Medium Close-Up", "Wide Two-Shot", "Close-Up", "Over-Shoulder", "Dutch Angle")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(titleDialog, color = TextPrimary, fontWeight = FontWeight.Bold) },
        text = {
            LazyColumn(
                modifier = Modifier.fillMaxWidth().heightIn(max = 420.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Scene Title") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
                item {
                    OutlinedTextField(
                        value = prompt,
                        onValueChange = { prompt = it },
                        label = { Text("3D Visual Prompt & Staging") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )
                }
                item {
                    OutlinedTextField(
                        value = narration,
                        onValueChange = { narration = it },
                        label = { Text("Audio Narration / Spoken Dialog") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )
                }
                item {
                    OutlinedTextField(
                        value = duration,
                        onValueChange = { duration = it },
                        label = { Text("Duration (seconds)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
                item {
                    OutlinedTextField(
                        value = action,
                        onValueChange = { action = it },
                        label = { Text("Character Action / Gesture") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
                item {
                    Text("Camera Framing", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        angles.take(3).forEach { a ->
                            FilterChip(
                                selected = angle == a,
                                onClick = { angle = a },
                                label = { Text(a.split(" ").first()) }
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(
                        title.ifBlank { "Scene" },
                        prompt,
                        narration,
                        duration.toIntOrNull() ?: 15,
                        action,
                        angle
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary)
            ) {
                Text("Save Scene")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        },
        containerColor = StudioSurface
    )
}
