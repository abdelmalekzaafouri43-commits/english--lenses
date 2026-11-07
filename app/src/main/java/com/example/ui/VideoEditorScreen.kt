package com.example.ui

import androidx.compose.animation.core.*
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
fun VideoEditorScreen(viewModel: StudioViewModel) {
    val activeProject by viewModel.activeProject.collectAsState()
    val isPlaying by viewModel.isVideoPlaying.collectAsState()
    val progress by viewModel.playbackProgress.collectAsState()
    val aspectRatio by viewModel.videoAspectRatio.collectAsState()

    val scenes = activeProject?.scenes ?: emptyList()
    var selectedSceneIndex by remember { mutableIntStateOf(0) }
    val currentScene = scenes.getOrNull(selectedSceneIndex)

    // Playback loop simulation
    LaunchedEffect(isPlaying) {
        if (isPlaying) {
            while (true) {
                kotlinx.coroutines.delay(100L)
                val next = (viewModel.playbackProgress.value + 0.015f)
                if (next >= 1.0f) {
                    viewModel.playbackProgress.value = 0f
                    if (scenes.isNotEmpty()) {
                        selectedSceneIndex = (selectedSceneIndex + 1) % scenes.size
                    }
                } else {
                    viewModel.playbackProgress.value = next
                }
            }
        }
    }

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
                        text = "Video Editor & Playback Studio",
                        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
                    )
                    Text(
                        text = "Real-time canvas timeline composition and multi-track renderer",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )
                }

                // Aspect Ratio Selector
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = aspectRatio == "16:9 Landscape",
                        onClick = { viewModel.videoAspectRatio.value = "16:9 Landscape" },
                        label = { Text("16:9 Landscape") }
                    )
                    FilterChip(
                        selected = aspectRatio == "9:16 Vertical",
                        onClick = { viewModel.videoAspectRatio.value = "9:16 Vertical" },
                        label = { Text("9:16 Mobile") }
                    )
                }
            }
        }

        // Live Video Preview Canvas
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(if (aspectRatio == "9:16 Vertical") 380.dp else 260.dp)
                    .clip(RoundedCornerShape(16.dp)),
                colors = CardDefaults.cardColors(containerColor = StudioSurface)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(Color(0xFF030712), Color(0xFF111827), Color(0xFF0F172A))
                            )
                        )
                        .border(1.dp, StudioBorder, RoundedCornerShape(16.dp))
                ) {
                    // Video Scene Graphics Canvas
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val w = size.width
                        val h = size.height

                        // Ambient Stage Glow
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(StudioPurpleDark.copy(alpha = 0.5f), Color.Transparent),
                                center = Offset(w / 2f, h / 2f),
                                radius = w * 0.45f
                            )
                        )

                        // 3D Animated Teacher Avatar representation
                        val animOffset = if (isPlaying) kotlin.math.sin(progress * 15f) * 8f else 0f
                        drawCircle(
                            color = StudioBlueCyan,
                            radius = 32f,
                            center = Offset(w / 2f, h * 0.38f + animOffset)
                        )
                        drawLine(
                            color = StudioPurplePrimary,
                            start = Offset(w / 2f, h * 0.42f + animOffset),
                            end = Offset(w / 2f, h * 0.70f + animOffset),
                            strokeWidth = 20f
                        )

                        // Floating Title Card in Scene
                        drawLine(
                            color = StudioBlueAccent,
                            start = Offset(w * 0.2f, h * 0.25f),
                            end = Offset(w * 0.8f, h * 0.25f),
                            strokeWidth = 3f
                        )
                    }

                    // On-screen Subtitles Overlay
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Top Status Bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Surface(
                                color = Color.Black.copy(alpha = 0.7f),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = if (isPlaying) "● PLAYING [PROD 1080P]" else "❚❚ PAUSED",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = if (isPlaying) StudioGreen else StudioAmber,
                                        fontWeight = FontWeight.Bold
                                    ),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }

                            Surface(
                                color = Color.Black.copy(alpha = 0.7f),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                val totalSeconds = scenes.sumOf { it.durationSeconds }
                                val currentSec = (progress * (currentScene?.durationSeconds ?: 15)).toInt()
                                Text(
                                    text = "00:${if (currentSec < 10) "0$currentSec" else "$currentSec"} / 00:$totalSeconds",
                                    style = MaterialTheme.typography.labelSmall.copy(color = Color.White),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        // Bottom Subtitles Overlay
                        Surface(
                            color = Color.Black.copy(alpha = 0.8f),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .align(Alignment.CenterHorizontally)
                                .padding(horizontal = 20.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = currentScene?.narration ?: "Welcome to English Lenses Studio",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = Color.Yellow,
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 0.5.sp
                                ),
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }
        }

        // Timeline Playback Controls
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    // Scrubber Bar
                    Slider(
                        value = progress,
                        onValueChange = { viewModel.playbackProgress.value = it },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = {
                                    if (selectedSceneIndex > 0) {
                                        selectedSceneIndex--
                                        viewModel.playbackProgress.value = 0f
                                    }
                                }
                            ) {
                                Icon(Icons.Default.SkipPrevious, contentDescription = "Prev Scene")
                            }

                            IconButton(
                                onClick = { viewModel.isVideoPlaying.value = !isPlaying },
                                colors = IconButtonDefaults.iconButtonColors(containerColor = StudioPurplePrimary, contentColor = Color.White)
                            ) {
                                Icon(if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow, contentDescription = "Play/Pause")
                            }

                            IconButton(
                                onClick = {
                                    if (selectedSceneIndex < scenes.lastIndex) {
                                        selectedSceneIndex++
                                        viewModel.playbackProgress.value = 0f
                                    }
                                }
                            ) {
                                Icon(Icons.Default.SkipNext, contentDescription = "Next Scene")
                            }
                        }

                        // Current Scene Indicator
                        Text(
                            text = "Scene ${selectedSceneIndex + 1} of ${scenes.size}: ${currentScene?.title ?: "No Scene"}",
                            style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary, fontWeight = FontWeight.Bold)
                        )
                    }
                }
            }
        }

        // Multi-Track Timeline Visualizer
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurfaceVariant),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Multi-Track Timeline", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary, fontWeight = FontWeight.Bold))

                    TimelineTrack(label = "V1: 3D Animation Video", color = StudioPurplePrimary, count = scenes.size)
                    TimelineTrack(label = "A1: Spoken Narration", color = StudioBlueAccent, count = scenes.size)
                    TimelineTrack(label = "T1: Subtitles & Syntax", color = StudioAmber, count = scenes.size)
                    TimelineTrack(label = "M1: Background Music", color = StudioGreen, count = 1)
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
private fun TimelineTrack(label: String, color: Color, count: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(32.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary), modifier = Modifier.width(130.dp))
        Row(
            modifier = Modifier.weight(1f),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            for (i in 0 until count) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(4.dp))
                        .background(color.copy(alpha = 0.7f))
                )
            }
        }
    }
}
