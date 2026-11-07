package com.example.ui

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.theme.*

@Composable
fun ExportCenterScreen(viewModel: StudioViewModel) {
    val activeProject by viewModel.activeProject.collectAsState()

    var resolution by remember { mutableStateOf("1080p Full HD (60fps)") }
    var format by remember { mutableStateOf("MP4 (H.264 Universal)") }
    var burnSubtitles by remember { mutableStateOf(true) }
    var isRendering by remember { mutableStateOf(false) }
    var renderProgress by remember { mutableFloatStateOf(0f) }
    var exportSuccess by remember { mutableStateOf(false) }

    val resolutions = listOf("1080p Full HD (60fps)", "4K UHD Cinema", "720p Mobile Fast")
    val formats = listOf("MP4 (H.264 Universal)", "WebM (HTML5 Optimized)")

    // Render progress simulation
    LaunchedEffect(isRendering) {
        if (isRendering) {
            renderProgress = 0f
            exportSuccess = false
            while (renderProgress < 1.0f) {
                kotlinx.coroutines.delay(120L)
                renderProgress += 0.05f
            }
            isRendering = false
            exportSuccess = true
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
            Text(
                text = "Export Center",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
            )
            Text(
                text = "High-fidelity rendering, video compilation & subtitle packaging for: ${activeProject?.title ?: "Current Lesson"}",
                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
            )
        }

        // Export Configuration Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Render Quality & Resolution", style = MaterialTheme.typography.titleSmall.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        resolutions.forEach { res ->
                            FilterChip(
                                selected = resolution == res,
                                onClick = { resolution = res },
                                label = { Text(res) },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Video Container Format", style = MaterialTheme.typography.titleSmall.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        formats.forEach { fmt ->
                            FilterChip(
                                selected = format == fmt,
                                onClick = { format = fmt },
                                label = { Text(fmt.split(" ").first()) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Burn In Lesson Subtitles", style = MaterialTheme.typography.bodyMedium.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                            Text("Hardcode vocabulary keywords and syntax directly on frame", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                        }
                        Switch(
                            checked = burnSubtitles,
                            onCheckedChange = { burnSubtitles = it }
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    if (isRendering) {
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text("Compiling 3D Scenes, Audio & Subtitles... ${(renderProgress * 100).toInt()}%", style = MaterialTheme.typography.bodySmall.copy(color = StudioBlueAccent))
                            Spacer(modifier = Modifier.height(6.dp))
                            LinearProgressIndicator(
                                progress = { renderProgress },
                                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                color = StudioPurplePrimary,
                                trackColor = StudioSurfaceVariant
                            )
                        }
                    } else {
                        Button(
                            onClick = { isRendering = true },
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.MovieFilter, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Render & Compile Master Video")
                        }
                    }

                    if (exportSuccess) {
                        Surface(
                            color = Color(0xFF1E3A2F),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = StudioGreen)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text("Video Ready for Classroom & Web Distribution!", style = MaterialTheme.typography.bodyMedium.copy(color = Color.White, fontWeight = FontWeight.Bold))
                                    Text("${activeProject?.title}.mp4 ($resolution, ${activeProject?.scenes?.size ?: 3} Scenes)", style = MaterialTheme.typography.bodySmall.copy(color = StudioGreen))
                                }
                            }
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
