package com.example.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.theme.*

@Composable
fun VoiceStudioScreen(viewModel: StudioViewModel) {
    val activeProject by viewModel.activeProject.collectAsState()
    val voice by viewModel.selectedVoice.collectAsState()
    val speed by viewModel.voiceSpeed.collectAsState()
    val pitch by viewModel.voicePitch.collectAsState()
    val isPlaying by viewModel.isPlayingVoicePreview.collectAsState()

    val voices = listOf("British Academic (Male)", "American Narrator (Female)", "Young Storyteller", "Australian Accent")
    val narrationSample = activeProject?.scenes?.firstOrNull()?.narration
        ?: "Welcome to English Lenses! Today we will practice polite indirect questions in everyday conversation."

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioBackground)
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Voice Studio",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
            )
            Text(
                text = "Neural educational speech synthesis and acoustic voice actor tuning",
                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
            )
        }

        // Voice Waveform & Playback Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurface),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Active Voice Engine", style = MaterialTheme.typography.labelSmall.copy(color = TextSecondary))
                            Text(voice, style = MaterialTheme.typography.titleMedium.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                        }
                        IconButton(
                            onClick = { viewModel.isPlayingVoicePreview.value = !isPlaying },
                            colors = IconButtonDefaults.iconButtonColors(
                                containerColor = if (isPlaying) StudioGreen else StudioPurplePrimary,
                                contentColor = Color.White
                            )
                        ) {
                            Icon(if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow, contentDescription = "Play/Pause")
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Audio Waveform Visualization Canvas
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(80.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(StudioSurfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        Canvas(modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp, vertical = 10.dp)) {
                            val w = size.width
                            val h = size.height
                            val barCount = 40
                            val barWidth = (w / barCount) * 0.6f

                            for (i in 0 until barCount) {
                                val x = (w / barCount) * i + barWidth / 2f
                                val normalizedHeight = if (isPlaying) {
                                    val wave = kotlin.math.sin((i * 0.4f) + (System.currentTimeMillis() % 1000) / 100f)
                                    (0.2f + 0.7f * kotlin.math.abs(wave.toFloat()))
                                } else {
                                    val staticPattern = listOf(0.3f, 0.5f, 0.8f, 0.4f, 0.6f, 0.9f, 0.2f, 0.7f)
                                    staticPattern[i % staticPattern.size]
                                }
                                val barH = h * normalizedHeight
                                val topY = (h - barH) / 2f
                                drawRect(
                                    color = if (isPlaying) StudioBlueAccent else StudioPurpleLight.copy(alpha = 0.7f),
                                    topLeft = Offset(x, topY),
                                    size = androidx.compose.ui.geometry.Size(barWidth, barH)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "Narration Script (Scene 1):",
                        style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "\"$narrationSample\"",
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.White, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                    )
                }
            }
        }

        // Voice Controls
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Select Voice Character", style = MaterialTheme.typography.titleSmall.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        voices.forEach { v ->
                            FilterChip(
                                selected = voice == v,
                                onClick = { viewModel.selectedVoice.value = v },
                                label = { Text(v) },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Speech Pace: ${(speed * 100).toInt()}%", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                        Text(if (speed > 1f) "Energetic" else "Natural", style = MaterialTheme.typography.bodySmall.copy(color = StudioBlueAccent))
                    }
                    Slider(
                        value = speed,
                        onValueChange = { viewModel.voiceSpeed.value = it },
                        valueRange = 0.75f..1.5f
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Pitch / Inflection: ${(pitch * 100).toInt()}%", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                        Text("Clear Academic", style = MaterialTheme.typography.bodySmall.copy(color = StudioPurpleLight))
                    }
                    Slider(
                        value = pitch,
                        onValueChange = { viewModel.voicePitch.value = it },
                        valueRange = 0.8f..1.2f
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
