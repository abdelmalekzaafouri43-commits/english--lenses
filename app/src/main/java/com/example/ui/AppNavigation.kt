package com.example.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.theme.*
import com.google.firebase.auth.FirebaseAuth

@Composable
fun AppNavigation() {
    var currentUser by remember { mutableStateOf(FirebaseAuth.getInstance().currentUser) }

    DisposableEffect(Unit) {
        val listener = FirebaseAuth.AuthStateListener { auth ->
            currentUser = auth.currentUser
        }
        FirebaseAuth.getInstance().addAuthStateListener(listener)
        onDispose {
            FirebaseAuth.getInstance().removeAuthStateListener(listener)
        }
    }

    if (currentUser == null) {
        AuthScreen(onAuthSuccess = { currentUser = FirebaseAuth.getInstance().currentUser })
    } else {
        val studioViewModel: StudioViewModel = viewModel()
        StudioMainWorkspace(
            viewModel = studioViewModel,
            onSignOut = {
                FirebaseAuth.getInstance().signOut()
                currentUser = null
            }
        )
    }
}

@Composable
private fun StudioMainWorkspace(
    viewModel: StudioViewModel,
    onSignOut: () -> Unit
) {
    val currentSection by viewModel.currentSection.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val activeProject by viewModel.activeProject.collectAsState()

    val configuration = LocalConfiguration.current
    val isWideScreen = configuration.screenWidthDp >= 600

    // User can manually collapse/expand sidebar
    var isSidebarExpanded by remember { mutableStateOf(isWideScreen) }

    val navItems = listOf(
        NavigationItem("Dashboard", Icons.Default.Dashboard, "Studio Overview"),
        NavigationItem("Lesson Creator", Icons.Default.AutoAwesome, "AI Script & Storyboard"),
        NavigationItem("Animation", Icons.Default.ViewInAr, "3D Character Rigging"),
        NavigationItem("Voice", Icons.Default.Mic, "Speech & Narration"),
        NavigationItem("Storyboard", Icons.Default.EditNote, "Scene Choreography"),
        NavigationItem("Video Editor", Icons.Default.PlayCircle, "Timeline & Player"),
        NavigationItem("Projects", Icons.Default.Folder, "My Curriculum Projects"),
        NavigationItem("Export", Icons.Default.FileDownload, "Render Master MP4"),
        NavigationItem("Settings", Icons.Default.Settings, "Studio Preferences")
    )

    // BackHandler returns to Dashboard if on a sub-tool
    BackHandler(enabled = currentSection != "Dashboard") {
        viewModel.navigateTo("Dashboard")
    }

    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(uiState) {
        when (val state = uiState) {
            is StudioUiState.Success -> {
                snackbarHostState.showSnackbar(state.message)
                viewModel.dismissUiState()
            }
            is StudioUiState.Error -> {
                snackbarHostState.showSnackbar(state.message)
                viewModel.dismissUiState()
            }
            else -> {}
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = StudioBackground
    ) { innerPadding ->
        // "The dashboard is always on the left of the screen"
        // Layout: Row with Permanent Left Sidebar + Main Content Stage
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // LEFT SIDEBAR (DASHBOARD & NAVIGATION DOCK)
            StudioLeftSidebar(
                navItems = navItems,
                currentSection = currentSection,
                isExpanded = isSidebarExpanded,
                onToggleExpand = { isSidebarExpanded = !isSidebarExpanded },
                onSelectItem = { viewModel.navigateTo(it) },
                activeProjectTitle = activeProject?.title
            )

            // Vertical divider between sidebar and workspace
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(1.dp)
                    .background(StudioBorder)
            )

            // MAIN WORKSPACE CONTENT STAGE
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .background(StudioBackground)
            ) {
                when (currentSection) {
                    "Dashboard" -> DashboardScreen(
                        viewModel = viewModel,
                        onNavigateTo = { viewModel.navigateTo(it) }
                    )
                    "Lesson Creator" -> LessonCreatorScreen(
                        viewModel = viewModel,
                        onNavigateTo = { viewModel.navigateTo(it) }
                    )
                    "Animation" -> AnimationStudioScreen(viewModel = viewModel)
                    "Voice" -> VoiceStudioScreen(viewModel = viewModel)
                    "Storyboard" -> StoryboardScreen(
                        viewModel = viewModel,
                        onNavigateToVideoEditor = { viewModel.navigateTo("Video Editor") }
                    )
                    "Video Editor" -> VideoEditorScreen(viewModel = viewModel)
                    "Projects" -> ProjectsScreen(
                        viewModel = viewModel,
                        onOpenProject = { project ->
                            viewModel.selectProject(project)
                            viewModel.navigateTo("Storyboard")
                        }
                    )
                    "Export" -> ExportCenterScreen(viewModel = viewModel)
                    "Settings" -> SettingsScreen(onSignOut = onSignOut)
                    else -> DashboardScreen(
                        viewModel = viewModel,
                        onNavigateTo = { viewModel.navigateTo(it) }
                    )
                }
            }
        }
    }
}

private data class NavigationItem(
    val title: String,
    val icon: ImageVector,
    val subtitle: String
)

@Composable
private fun StudioLeftSidebar(
    navItems: List<NavigationItem>,
    currentSection: String,
    isExpanded: Boolean,
    onToggleExpand: () -> Unit,
    onSelectItem: (String) -> Unit,
    activeProjectTitle: String?
) {
    val sidebarWidth = if (isExpanded) 240.dp else 72.dp

    Column(
        modifier = Modifier
            .width(sidebarWidth)
            .fillMaxHeight()
            .background(StudioSurface)
            .padding(vertical = 16.dp, horizontal = if (isExpanded) 12.dp else 6.dp),
        horizontalAlignment = if (isExpanded) Alignment.Start else Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top: Branding & Collapse Toggle
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = if (isExpanded) Alignment.Start else Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = if (isExpanded) Arrangement.SpaceBetween else Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (isExpanded) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Brush.linearGradient(listOf(StudioPurplePrimary, StudioBlueAccent))),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.MovieFilter, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "ENGLISH LENSES",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Black,
                                    color = Color.White,
                                    letterSpacing = 0.5.sp
                                )
                            )
                            Text(
                                text = "AI Studio",
                                style = MaterialTheme.typography.labelSmall.copy(color = StudioBlueAccent)
                            )
                        }
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Brush.linearGradient(listOf(StudioPurplePrimary, StudioBlueAccent))),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.MovieFilter, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                    }
                }

                IconButton(
                    onClick = onToggleExpand,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        if (isExpanded) Icons.Default.ChevronLeft else Icons.Default.ChevronRight,
                        contentDescription = "Toggle Sidebar",
                        tint = TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
            Divider(color = StudioBorder)
            Spacer(modifier = Modifier.height(14.dp))

            // Navigation Items List
            navItems.forEach { item ->
                val isSelected = currentSection == item.title
                SidebarNavItem(
                    item = item,
                    isSelected = isSelected,
                    isExpanded = isExpanded,
                    onClick = { onSelectItem(item.title) }
                )
                Spacer(modifier = Modifier.height(6.dp))
            }
        }

        // Bottom: Active Project Badge
        if (isExpanded && activeProjectTitle != null) {
            Surface(
                color = StudioSurfaceVariant,
                shape = RoundedCornerShape(10.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.horizontalGradient(listOf(StudioBorder, StudioBorder))),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("ACTIVE PROJECT", style = MaterialTheme.typography.labelSmall.copy(color = StudioPurpleLight, fontWeight = FontWeight.Bold, fontSize = 9.sp))
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = activeProjectTitle,
                        style = MaterialTheme.typography.bodySmall.copy(color = Color.White, fontWeight = FontWeight.Bold),
                        maxLines = 1
                    )
                }
            }
        }
    }
}

@Composable
private fun SidebarNavItem(
    item: NavigationItem,
    isSelected: Boolean,
    isExpanded: Boolean,
    onClick: () -> Unit
) {
    val backgroundBrush = if (isSelected) {
        Brush.horizontalGradient(listOf(StudioPurplePrimary.copy(alpha = 0.9f), StudioPurpleDark.copy(alpha = 0.9f)))
    } else {
        Brush.horizontalGradient(listOf(Color.Transparent, Color.Transparent))
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .clickable(onClick = onClick),
        color = Color.Transparent,
        shape = RoundedCornerShape(8.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(backgroundBrush)
                .padding(vertical = 10.dp, horizontal = if (isExpanded) 12.dp else 4.dp),
            contentAlignment = if (isExpanded) Alignment.CenterStart else Alignment.Center
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = if (isExpanded) Arrangement.Start else Arrangement.Center
            ) {
                Icon(
                    item.icon,
                    contentDescription = item.title,
                    tint = if (isSelected) Color.White else TextSecondary,
                    modifier = Modifier.size(20.dp)
                )

                if (isExpanded) {
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = item.title,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = if (isSelected) Color.White else TextPrimary,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        ),
                        maxLines = 1
                    )
                }
            }
        }
    }
}
