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
fun LessonCreatorScreen(
    viewModel: StudioViewModel,
    onNavigateTo: (String) -> Unit
) {
    var title by remember { mutableStateOf("Travel & Airport English: Asking for Directions") }
    var topic by remember { mutableStateOf("Navigating an International Airport") }
    var schoolLevel by remember { mutableStateOf("Intermediate (B1)") }
    var durationMinutes by remember { mutableStateOf(3) }
    var objectives by remember { mutableStateOf("Enable students to confidently ask for departure gates, baggage claim, and customs guidance.") }
    var vocabulary by remember { mutableStateOf("boarding pass, terminal, baggage carousel, layover, customs declaration") }
    var grammar by remember { mutableStateOf("Polite indirect questions (e.g., 'Could you tell me where...?')") }
    var lessonContent by remember { mutableStateOf("Scene opens with a lost traveler at a bustling terminal inquiring at the information desk. Interactive 3D graphics highlight polite modals.") }

    val levels = listOf("Beginner (A1)", "Elementary (A2)", "Intermediate (B1)", "Upper-Intermediate (B2)", "Advanced (C1)")
    val uiState by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioBackground)
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "AI Lesson Creator",
                        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
                    )
                    Text(
                        text = "Automated pedagogical video script & storyboard generator",
                        style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
                    )
                }

                Surface(
                    color = Color(0xFF1E2838),
                    shape = RoundedCornerShape(20.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.Brush.horizontalGradient(listOf(StudioPurplePrimary, StudioBlueAccent)))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = StudioBlueAccent, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Demonstration & Gemini AI Mode", style = MaterialTheme.typography.labelSmall.copy(color = StudioBlueAccent, fontWeight = FontWeight.Bold))
                    }
                }
            }
        }

        // Form Fields Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Lesson Video Title *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = topic,
                        onValueChange = { topic = it },
                        label = { Text("Core Lesson Topic *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Text("School / Proficiency Level", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        levels.forEach { lvl ->
                            FilterChip(
                                selected = schoolLevel == lvl,
                                onClick = { schoolLevel = lvl },
                                label = { Text(lvl.split(" ").first()) }
                            )
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Target Video Duration: $durationMinutes min", style = MaterialTheme.typography.bodyMedium.copy(color = TextPrimary))
                        Slider(
                            value = durationMinutes.toFloat(),
                            onValueChange = { durationMinutes = it.toInt() },
                            valueRange = 1f..10f,
                            steps = 8,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    OutlinedTextField(
                        value = grammar,
                        onValueChange = { grammar = it },
                        label = { Text("Grammar Focus / Target Structure") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = vocabulary,
                        onValueChange = { vocabulary = it },
                        label = { Text("Key Vocabulary (Comma-separated)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = objectives,
                        onValueChange = { objectives = it },
                        label = { Text("Pedagogical Learning Objectives") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )

                    OutlinedTextField(
                        value = lessonContent,
                        onValueChange = { lessonContent = it },
                        label = { Text("Lesson Content & Scenario Details") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = {
                            viewModel.generateAiLesson(
                                title = title,
                                topic = topic,
                                level = schoolLevel,
                                durationMinutes = durationMinutes,
                                objectives = objectives,
                                vocabulary = vocabulary,
                                grammar = grammar,
                                contentNotes = lessonContent
                            )
                        },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = StudioPurplePrimary),
                        shape = RoundedCornerShape(10.dp),
                        enabled = uiState !is StudioUiState.Loading
                    ) {
                        if (uiState is StudioUiState.Loading) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text("Generating 3D Lesson Storyboard...")
                        } else {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Generate Full Video Storyboard & Script", fontWeight = FontWeight.Bold)
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
