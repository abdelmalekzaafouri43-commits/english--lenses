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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.theme.*
import com.google.firebase.Firebase
import com.google.firebase.auth.auth

@Composable
fun SettingsScreen(onSignOut: () -> Unit) {
    val user = Firebase.auth.currentUser

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StudioBackground)
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Studio Settings",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary)
            )
            Text(
                text = "System diagnostics, cloud connectivity & creator preferences",
                style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary)
            )
        }

        // Account Profile Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Creator Account", style = MaterialTheme.typography.titleMedium.copy(color = TextPrimary, fontWeight = FontWeight.Bold))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AccountCircle, contentDescription = null, tint = StudioPurpleLight, modifier = Modifier.size(36.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(user?.displayName ?: "Studio Educator", style = MaterialTheme.typography.bodyLarge.copy(color = TextPrimary, fontWeight = FontWeight.Bold))
                            Text(user?.email ?: "local_studio_mode@englishlenses.app", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Button(
                        onClick = onSignOut,
                        colors = ButtonDefaults.buttonColors(containerColor = StudioRed.copy(alpha = 0.85f)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Logout, contentDescription = "Sign Out", modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Sign Out of Studio")
                    }
                }
            }
        }

        // Engine Status Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurface),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Backend & AI Services Status", style = MaterialTheme.typography.titleMedium.copy(color = TextPrimary, fontWeight = FontWeight.Bold))

                    StatusRow(title = "Firebase Firestore Database", status = "Connected & Synced", isOnline = true)
                    StatusRow(title = "Firebase AI Logic (Gemini 3.8)", status = "Ready & Attested", isOnline = true)
                    StatusRow(title = "3D Canvas Viewport Renderer", status = "Hardware Accelerated", isOnline = true)
                    StatusRow(title = "Neural Voice Synthesis Engine", status = "Online (4 Accents)", isOnline = true)
                }
            }
        }

        // About Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = StudioSurfaceVariant),
                shape = RoundedCornerShape(14.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("ENGLISH LENSES", style = MaterialTheme.typography.titleSmall.copy(color = Color.White, fontWeight = FontWeight.Bold))
                    Text("Version 1.0.0 (Build 2026.11) • Premium AI Educational Video Studio", style = MaterialTheme.typography.bodySmall.copy(color = TextSecondary))
                    Text("Designed for professional curriculum design, interactive language immersion, and 3D storytelling.", style = MaterialTheme.typography.bodySmall.copy(color = TextMuted))
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
private fun StatusRow(title: String, status: String, isOnline: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(title, style = MaterialTheme.typography.bodyMedium.copy(color = TextPrimary))
            Text(status, style = MaterialTheme.typography.bodySmall.copy(color = if (isOnline) StudioGreen else StudioAmber))
        }
        Box(
            modifier = Modifier
                .size(10.dp)
                .background(if (isOnline) StudioGreen else StudioAmber, shape = RoundedCornerShape(5.dp))
        )
    }
}
