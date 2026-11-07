package com.example

import com.example.data.Project
import com.example.data.ProjectsRepository
import com.example.data.SceneItem
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class StudioUnitTest {

    private lateinit var repository: ProjectsRepository

    @Before
    fun setup() {
        // Pure JVM test with in-memory persistence
        repository = ProjectsRepository(null)
    }

    @Test
    fun testInitialDemoProjectsLoaded() = runBlocking {
        val projects = repository.localProjects.first()
        assertTrue("Initial projects list should not be empty", projects.isNotEmpty())
        assertEquals("Mastering Conditionals in 3D Space", projects.first().title)
        assertEquals(4, projects.first().scenes.size)
        assertEquals("Ready", projects.first().status)
    }

    @Test
    fun testCreateProjectWithCustomPedagogicalParameters() = runBlocking {
        val created = repository.createProject(
            title = "Business Negotiations in London",
            topic = "Conditional Bargaining & Polite Proposals",
            schoolLevel = "Upper-Intermediate (B2)",
            durationMinutes = 4,
            objectives = "Master polite negotiations",
            vocabulary = "leverage, concession, counter-proposal",
            grammar = "Second & Third Conditionals",
            lessonContent = "Scene set in corporate boardroom."
        )

        assertNotNull(created.id)
        assertEquals("Business Negotiations in London", created.title)
        assertEquals("Upper-Intermediate (B2)", created.schoolLevel)
        assertEquals(3, created.scenes.size)
        assertEquals(1, created.scenes[0].sceneNumber)
        assertEquals(2, created.scenes[1].sceneNumber)
        assertEquals(3, created.scenes[2].sceneNumber)

        val all = repository.localProjects.first()
        assertTrue(all.any { it.id == created.id })
    }

    @Test
    fun testRenameProjectWorkflow() = runBlocking {
        val project = repository.createProject(title = "Draft Lesson")
        repository.renameProject(project.id, "Final Master English Lesson")

        val all = repository.localProjects.first()
        val found = all.find { it.id == project.id }
        assertNotNull(found)
        assertEquals("Final Master English Lesson", found?.title)
    }

    @Test
    fun testDuplicateProjectWorkflow() = runBlocking {
        val project = repository.createProject(title = "Idioms Part 1")
        val duplicate = repository.duplicateProject(project.id)

        assertNotNull(duplicate)
        assertNotEquals(project.id, duplicate?.id)
        assertEquals("Idioms Part 1 (Copy)", duplicate?.title)

        val all = repository.localProjects.first()
        assertEquals(2, all.count { it.title.startsWith("Idioms Part 1") })
    }

    @Test
    fun testDeleteProjectWorkflow() = runBlocking {
        val project = repository.createProject(title = "Obsolete Project")
        assertTrue(repository.localProjects.first().any { it.id == project.id })

        repository.deleteProject(project.id)
        assertFalse(repository.localProjects.first().any { it.id == project.id })
    }

    @Test
    fun testSceneReorderingAlgorithm() {
        val scenes = mutableListOf(
            SceneItem(id = "s1", sceneNumber = 1, title = "Scene 1"),
            SceneItem(id = "s2", sceneNumber = 2, title = "Scene 2"),
            SceneItem(id = "s3", sceneNumber = 3, title = "Scene 3")
        )

        // Move Scene 3 up to position 2
        val item = scenes.removeAt(2)
        scenes.add(1, item)
        val renumbered = scenes.mapIndexed { idx, s -> s.copy(sceneNumber = idx + 1) }

        assertEquals("s1", renumbered[0].id)
        assertEquals(1, renumbered[0].sceneNumber)

        assertEquals("s3", renumbered[1].id)
        assertEquals(2, renumbered[1].sceneNumber)

        assertEquals("s2", renumbered[2].id)
        assertEquals(3, renumbered[2].sceneNumber)
    }

    @Test
    fun testSceneDeletionAndRenumberingAlgorithm() {
        val scenes = listOf(
            SceneItem(id = "s1", sceneNumber = 1, title = "Intro"),
            SceneItem(id = "s2", sceneNumber = 2, title = "Middle"),
            SceneItem(id = "s3", sceneNumber = 3, title = "Outro")
        )

        val remaining = scenes.filterNot { it.id == "s2" }
            .mapIndexed { idx, s -> s.copy(sceneNumber = idx + 1) }

        assertEquals(2, remaining.size)
        assertEquals("s1", remaining[0].id)
        assertEquals(1, remaining[0].sceneNumber)
        assertEquals("s3", remaining[1].id)
        assertEquals(2, remaining[1].sceneNumber)
    }
}
