package com.example.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Project
import com.example.ui.theme.*

@Composable
fun DashboardScreen(
    viewModel: StudioViewModel,
    onNavigateTo: (String) -> Unit
) {
    val projects by viewModel.projects.collectAsState()
    val activeProject by viewModel.activeProject.collectAsState()

    var showNewProjectDialog by remember { mutableStateOf(false) }
    var projectToRename by remember { mutableStateOf<Project?>(null) }
    var renameText by remember { mutableStateOf("") }
    var projectToDelete by remember { mutableStateOf<Project?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioBackground)
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Hero Studio Banner
        item {
            StudioHeroBanner(
                totalProjects = projects.size,
                activeTitle = activeProject?.title ?: "No project selected",
                onNewProject = { showNewProjectDialog = true },
                onLaunchAiCreator = { onNavigateTo("Lesson Creator") }
            )
        }

        // Quick Stats Row
        item {
            StudioMetricsRow(
                projectCount = projects.size,
                totalScenes = projects.sumOf { it.sceneCount },
                activeLevel = activeProject?.schoolLevel ?: "B1 Intermediate"
            )
        }

        // Studio Workflow Tools Section
        item {
            Text(
                text = "Studio Production Suites",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            )
            Spacer(modifier = Modifier.height(12.dp))
            StudioSuitesGrid(onNavigateTo = onNavigateTo)
        }

        // Recent Projects Header & Action
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Recent Studio Projects",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    )
                    Text(
                        text = "Real-time synced educational video productions",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )
                }
                Button(
                    onClick = { showNewProjectDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "New Project", modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("New Project")
                }
            }
        }

        // Projects List
        if (projects.isEmpty()) {
            item {
                EmptyProjectsCard(onNewProject = { showNewProjectDialog = true })
            }
        } else {
            items(projects, key = { it.id }) { project ->
                ProjectCardItem(
                    project = project,
                    isActive = project.id == activeProject?.id,
                    onOpen = {
                        viewModel.selectProject(project)
                        onNavigateTo("Storyboard")
                    },
                    onRename = {
                        projectToRename = project
                        renameText = project.title
                    },
                    onDuplicate = { viewModel.duplicateProject(project.id) },
                    onDelete = { projectToDelete = project }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }

    // Dialog: Create New Project
    if (showNewProjectDialog) {
        CreateProjectDialog(
            onDismiss = { showNewProjectDialog = false },
            onCreate = { title, topic, level, duration, obj, vocab, grammar, content ->
                viewModel.createProject(title, topic, level, duration, obj, vocab, grammar, content)
                showNewProjectDialog = false
            }
        )
    }

    // Dialog: Rename Project
    if (projectToRename != null) {
        AlertDialog(
            onDismissRequest = { projectToRename = null },
            title = { Text("Rename Project", color = TextPrimary) },
            text = {
                OutlinedTextField(
                    value = renameText,
                    onValueChange = { renameText = it },
                    label = { Text("Project Title") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (renameText.isNotBlank()) {
                            viewModel.renameProject(projectToRename!!.id, renameText.trim())
                            projectToRename = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary)
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { projectToRename = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = StudioSurface
        )
    }

    // Dialog: Delete Project Confirmation
    if (projectToDelete != null) {
        AlertDialog(
            onDismissRequest = { projectToDelete = null },
            title = { Text("Delete Project?", color = TextPrimary) },
            text = {
                Text(
                    "Are you sure you want to delete \"${projectToDelete!!.title}\"? This action cannot be undone.",
                    color = TextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteProject(projectToDelete!!.id)
                        projectToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StudioRed)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { projectToDelete = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = StudioSurface
        )
    }
}

@Composable
private fun StudioHeroBanner(
    totalProjects: Int,
    activeTitle: String,
    onNewProject: () -> Unit,
    onLaunchAiCreator: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF2E1065),
                            Color(0xFF1E1B4B),
                            Color(0xFF0F172A)
                        )
                    )
                )
                .border(1.dp, StudioBorder, RoundedCornerShape(16.dp))
                .padding(24.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(RoundedCornerShape(5.dp))
                            .background(StudioGreen)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "AI VIDEO PRODUCTION ENGINE ONLINE",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = StudioBlueAccent,
                            letterSpacing = 1.2.sp
                        )
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "ENGLISH LENSES",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        letterSpacing = 0.5.sp
                    )
                )
                Text(
                    text = "Transform curriculum topics into cinematic 3D animated educational lessons in minutes.",
                    style = MaterialTheme.typography.bodyMedium.copy(color = Color(0xFFCBD5E1))
                )
                Spacer(modifier = Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(
                        onClick = onLaunchAiCreator,
                        colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("AI Lesson Creator")
                    }
                    OutlinedButton(
                        onClick = onNewProject,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                        border = ButtonDefaults.outlinedButtonBorder.copy(brush = Brush.linearGradient(listOf(StudioBlueAccent, StudioPurpleLight))),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Blank Project")
                    }
                }
            }
        }
    }
}

@Composable
private fun StudioMetricsRow(
    projectCount: Int,
    totalScenes: Int,
    activeLevel: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        MetricItem(title = "Total Projects", value = "$projectCount", icon = Icons.Default.Folder, accent = StudioPurplePrimary, modifier = Modifier.weight(1f))
        MetricItem(title = "Scenes Ready", value = "$totalScenes", icon = Icons.Default.MovieFilter, accent = StudioBlueAccent, modifier = Modifier.weight(1f))
        MetricItem(title = "Active Level", value = activeLevel.split(" ").firstOrNull() ?: "B1", icon = Icons.Default.School, accent = StudioAmber, modifier = Modifier.weight(1f))
        MetricItem(title = "Render Engine", value = "1080p 60fps", icon = Icons.Default.HighQuality, accent = StudioGreen, modifier = Modifier.weight(1f))
    }
}

@Composable
private fun MetricItem(
    title: String,
    value: String,
    icon: ImageVector,
    accent: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = StudioSurface),
        shape = RoundedCornerShape(12.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.horizontalGradient(listOf(StudioBorder, StudioSurfaceVariant)))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = title, style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary))
                Icon(icon, contentDescription = null, tint = accent, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            )
        }
    }
}

@Composable
private fun StudioSuitesGrid(onNavigateTo: (String) -> Unit) {
    val suites = listOf(
        Triple("AI Lesson Creator", "Generate full scripts & storyboards with AI prompts", Icons.Default.AutoAwesome) to "Lesson Creator",
        Triple("3D Animation Studio", "Character avatars, rigs & cinematic camera staging", Icons.Default.ViewInAr) to "Animation",
        Triple("Voice Studio", "Multi-accent speech synthesis, pitch & waveforms", Icons.Default.Mic) to "Voice",
        Triple("Storyboard Editor", "Scene-by-scene timing, narration & action prompts", Icons.Default.EditNote) to "Storyboard",
        Triple("Video Editor", "Multi-track timeline preview with live overlays", Icons.Default.PlayCircle) to "Video Editor",
        Triple("Export Center", "High-definition MP4 rendering & subtitles", Icons.Default.FileDownload) to "Export"
    )

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        for (i in suites.indices step 2) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                SuiteCard(
                    title = suites[i].first.first,
                    desc = suites[i].first.second,
                    icon = suites[i].first.third,
                    modifier = Modifier.weight(1f),
                    onClick = { onNavigateTo(suites[i].second) }
                )
                if (i + 1 < suites.size) {
                    SuiteCard(
                        title = suites[i + 1].first.first,
                        desc = suites[i + 1].first.second,
                        icon = suites[i + 1].first.third,
                        modifier = Modifier.weight(1f),
                        onClick = { onNavigateTo(suites[i + 1].second) }
                    )
                }
            }
        }
    }
}

@Composable
private fun SuiteCard(
    title: String,
    desc: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = StudioSurfaceVariant),
        border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = Brush.linearGradient(listOf(StudioBorder, StudioSurfaceHover)))
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Brush.linearGradient(listOf(StudioPurplePrimary, StudioBlueAccent))),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = title, tint = Color.White, modifier = Modifier.size(22.dp))
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                )
                Text(
                    text = desc,
                    style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary),
                    maxLines = 1
                )
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
        }
    }
}

@Composable
private fun ProjectCardItem(
    project: Project,
    isActive: Boolean,
    onOpen: () -> Unit,
    onRename: () -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onOpen),
        colors = CardDefaults.cardColors(
            containerColor = if (isActive) StudioSurfaceHover else StudioSurface
        ),
        border = CardDefaults.outlinedCardBorder().copy(
            width = if (isActive) 1.5.dp else 1.dp,
            brush = if (isActive) Brush.horizontalGradient(listOf(StudioPurplePrimary, StudioBlueAccent)) else Brush.horizontalGradient(listOf(StudioBorder, StudioBorder))
        )
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(StudioSurfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Movie, contentDescription = null, tint = StudioPurpleLight, modifier = Modifier.size(20.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = project.title,
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        )
                        Text(
                            text = "${project.topic} • ${project.schoolLevel}",
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                        )
                    }
                }

                // Status Badge
                Surface(
                    color = when (project.status) {
                        "Ready" -> Color(0xFF1E3A2F)
                        "In Production" -> Color(0xFF3B2F17)
                        else -> StudioSurfaceVariant
                    },
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = project.status,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = when (project.status) {
                                "Ready" -> StudioGreen
                                "In Production" -> StudioAmber
                                else -> TextSecondary
                            },
                            fontWeight = FontWeight.Bold
                        ),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Project Details Summary
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.ViewCarousel, contentDescription = null, tint = TextMuted, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("${project.sceneCount} Scenes", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Schedule, contentDescription = null, tint = TextMuted, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("${project.durationMinutes} min", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Spellcheck, contentDescription = null, tint = TextMuted, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(project.grammar.take(24) + "...", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                }
            }

            Spacer(modifier = Modifier.height(14.dp))
            Divider(color = StudioBorder)
            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onRename) {
                    Icon(Icons.Default.DriveFileRenameOutline, contentDescription = "Rename", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Rename", color = TextSecondary)
                }
                TextButton(onClick = onDuplicate) {
                    Icon(Icons.Default.ContentCopy, contentDescription = "Duplicate", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Duplicate", color = TextSecondary)
                }
                TextButton(onClick = onDelete) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", modifier = Modifier.size(16.dp), tint = StudioRed)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete", color = StudioRed)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = onOpen,
                    colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Open Studio")
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                }
            }
        }
    }
}

@Composable
private fun EmptyProjectsCard(onNewProject: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = StudioSurface),
        shape = RoundedCornerShape(16.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.horizontalGradient(listOf(StudioBorder, StudioBorder)))
    ) {
        Column(
            modifier = Modifier.padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(Icons.Default.VideoLibrary, contentDescription = null, tint = StudioPurpleLight, modifier = Modifier.size(48.dp))
            Spacer(modifier = Modifier.height(12.dp))
            Text("No Educational Video Projects Yet", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary))
            Spacer(modifier = Modifier.height(6.dp))
            Text("Create your first English video lesson using our AI Lesson Creator or start with a custom template.", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onNewProject,
                colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary)
            ) {
                Text("Create First Project")
            }
        }
    }
}

@Composable
private fun CreateProjectDialog(
    onDismiss: () -> Unit,
    onCreate: (title: String, topic: String, level: String, duration: Int, obj: String, vocab: String, grammar: String, content: String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var topic by remember { mutableStateOf("Conversational Idioms & Expressions") }
    var schoolLevel by remember { mutableStateOf("Intermediate (B1)") }
    var durationMinutes by remember { mutableStateOf("3") }
    var grammar by remember { mutableStateOf("Past Simple vs Present Perfect") }
    var vocabulary by remember { mutableStateOf("break the ice, bite the bullet, call it a day") }
    var objectives by remember { mutableStateOf("Learn common conversational idioms and their daily usage.") }
    var lessonContent by remember { mutableStateOf("A real-world dialogue between friends planning an event.") }

    val levels = listOf("Beginner (A1)", "Elementary (A2)", "Intermediate (B1)", "Upper-Intermediate (B2)", "Advanced (C1)")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                "Create New Video Project",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 450.dp)
            ) {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    item {
                        OutlinedTextField(
                            value = title,
                            onValueChange = { title = it },
                            label = { Text("Lesson Title *") },
                            placeholder = { Text("e.g. Mastering English Idioms in 3D") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = topic,
                            onValueChange = { topic = it },
                            label = { Text("Topic / Subject") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        Text("School Level", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            levels.take(3).forEach { lvl ->
                                FilterChip(
                                    selected = schoolLevel == lvl,
                                    onClick = { schoolLevel = lvl },
                                    label = { Text(lvl.split(" ").first()) }
                                )
                            }
                        }
                    }
                    item {
                        OutlinedTextField(
                            value = grammar,
                            onValueChange = { grammar = it },
                            label = { Text("Target Grammar Structure") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = vocabulary,
                            onValueChange = { vocabulary = it },
                            label = { Text("Vocabulary Words") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = lessonContent,
                            onValueChange = { lessonContent = it },
                            label = { Text("Lesson Outline & Notes") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val finalTitle = if (title.isBlank()) "Untitled Lesson Studio Project" else title.trim()
                    onCreate(
                        finalTitle,
                        topic,
                        schoolLevel,
                        durationMinutes.toIntOrNull() ?: 3,
                        objectives,
                        vocabulary,
                        grammar,
                        lessonContent
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary)
            ) {
                Text("Create Project")
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
