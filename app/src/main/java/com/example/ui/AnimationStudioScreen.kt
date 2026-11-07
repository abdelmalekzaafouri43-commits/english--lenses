package com.example.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

@Composable
fun AnimationStudioScreen(viewModel: StudioViewModel) {
    val activeProject by viewModel.activeProject.collectAsState()
    val avatar by viewModel.selectedAvatar.collectAsState()
    val environment by viewModel.selectedEnvironment.collectAsState()
    val action by viewModel.selectedAnimationAction.collectAsState()

    val avatars = listOf("Professor Aiden (3D)", "Maya Tech Tutor", "Cyberbot Mentor", "Captain Sarah")
    val environments = listOf("Futuristic Academy", "Glass Boardroom", "Sci-Fi Bridge", "Cozy Cafe 3D", "Virtual Lab")
    val actions = listOf("Welcoming & Engaging", "Explaining Board", "Pointing Dynamic", "Thinking Pose", "Celebration")

    var cameraAngle by remember { mutableStateOf("Medium Close-Up") }
    var lightingMood by remember { mutableStateOf("Cinematic Neon Purple") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioBackground)
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "3D Animation Studio",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
            )
            Text(
                text = "Interactive character staging, environments & camera choreography for: ${activeProject?.title ?: "Current Lesson"}",
                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
            )
        }

        // 3D Viewport Simulation
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .clip(RoundedCornerShape(16.dp)),
                colors = CardDefaults.cardColors(containerColor = StudioSurface)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(
                                    Color(0xFF0F172A),
                                    Color(0xFF1E1B4B),
                                    Color(0xFF020617)
                                )
                            )
                        )
                        .border(1.dp, StudioBorder, RoundedCornerShape(16.dp))
                ) {
                    // Animated 3D Stage Grid Canvas
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val w = size.width
                        val h = size.height

                        // Horizon line
                        drawLine(
                            color = StudioPurpleDark.copy(alpha = 0.5f),
                            start = Offset(0f, h * 0.65f),
                            end = Offset(w, h * 0.65f),
                            strokeWidth = 2f
                        )

                        // Perspective Grid Lines
                        val vanishingPoint = Offset(w / 2f, h * 0.65f)
                        for (i in 0..12) {
                            val bottomX = (w / 12) * i
                            drawLine(
                                color = StudioBlueAccent.copy(alpha = 0.25f),
                                start = vanishingPoint,
                                end = Offset(bottomX, h),
                                strokeWidth = 1.5f
                            )
                        }

                        // Character Silhouette / Hologram Glow
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(StudioPurpleLight.copy(alpha = 0.7f), Color.Transparent),
                                center = Offset(w / 2f, h * 0.45f),
                                radius = 90f
                            )
                        )
                        // Virtual Character Avatar Node
                        drawCircle(
                            color = StudioBlueCyan,
                            radius = 28f,
                            center = Offset(w / 2f, h * 0.38f)
                        )
                        // Body representation
                        drawLine(
                            color = StudioPurplePrimary,
                            start = Offset(w / 2f, h * 0.42f),
                            end = Offset(w / 2f, h * 0.65f),
                            strokeWidth = 16f
                        )
                        // Arm gesture
                        drawLine(
                            color = StudioBlueAccent,
                            start = Offset(w / 2f, h * 0.48f),
                            end = Offset(w / 2f + 50f, h * 0.40f),
                            strokeWidth = 8f
                        )
                    }

                    // Viewport HUD Overlays
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Surface(
                                color = Color.Black.copy(alpha = 0.6f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = "3D VIEWPORT [REC 60FPS] • $cameraAngle",
                                    style = MaterialTheme.typography.labelSmall.copy(color = StudioGreen, fontWeight = FontWeight.Bold),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                            Surface(
                                color = Color.Black.copy(alpha = 0.6f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = "RIG: $avatar",
                                    style = MaterialTheme.typography.labelSmall.copy(color = StudioBlueAccent),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        // Bottom Overlay: Action Status
                        Surface(
                            color = StudioSurface.copy(alpha = 0.85f),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Action: $action", style = MaterialTheme.typography.bodySmall.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                                Text("Environment: $environment", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                            }
                        }
                    }
                }
            }
        }

        // Rig & Environment Controls
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Select 3D Character Avatar", style = MaterialTheme.typography.titleSmall.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        avatars.take(2).forEach { av ->
                            FilterChip(
                                selected = avatar == av,
                                onClick = { viewModel.selectedAvatar.value = av },
                                label = { Text(av) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        avatars.drop(2).forEach { av ->
                            FilterChip(
                                selected = avatar == av,
                                onClick = { viewModel.selectedAvatar.value = av },
                                label = { Text(av) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("3D Virtual Environment", style = MaterialTheme.typography.titleSmall.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        environments.take(3).forEach { env ->
                            FilterChip(
                                selected = environment == env,
                                onClick = { viewModel.selectedEnvironment.value = env },
                                label = { Text(env.split(" ").first()) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Character Animation Pose & Action", style = MaterialTheme.typography.titleSmall.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        actions.take(3).forEach { act ->
                            FilterChip(
                                selected = action == act,
                                onClick = { viewModel.selectedAnimationAction.value = act },
                                label = { Text(act.split(" ").first()) }
                            )
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
