package br.com.projeto.taskmanager;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import br.com.projeto.taskmanager.model.Task;
import br.com.projeto.taskmanager.model.TaskStatus;

class TaskTest {

    @Test
    void testCriacaoTaskModel() {
        Task task = new Task(
                "Estudar",
                "DevOps",
                null,
                TaskStatus.PENDENTE,
                1L
        );

        assertEquals("Estudar", task.getTitulo());
        assertEquals(TaskStatus.PENDENTE, task.getStatus());
    }

    @Test
    void testGetters() {
        Task task = new Task(
                "Estudar",
                "DevOps",
                null,
                TaskStatus.PENDENTE,
                1L
        );

        assertEquals("Estudar", task.getTitulo());
        assertEquals("DevOps", task.getDescricao());
        assertNull(task.getDataConclusao());
        assertEquals(TaskStatus.PENDENTE, task.getStatus());
        assertEquals(1L, task.getId());
    }

    @Test
    void testSetters() {
        Task task = new Task();

        task.setTitulo("Nova tarefa");
        task.setDescricao("Descrição");
        task.setStatus(TaskStatus.CONCLUIDA);

        assertEquals("Nova tarefa", task.getTitulo());
        assertEquals("Descrição", task.getDescricao());
        assertEquals(TaskStatus.CONCLUIDA, task.getStatus());
    }

    @Test
    void testMudancaStatus() {
        Task task = new Task();

        task.setStatus(TaskStatus.PENDENTE);
        assertEquals(TaskStatus.PENDENTE, task.getStatus());

        task.setStatus(TaskStatus.CONCLUIDA);
        assertEquals(TaskStatus.CONCLUIDA, task.getStatus());
    }

    @Test
    void testEnumTaskStatus() {
        assertEquals("PENDENTE", TaskStatus.PENDENTE.name());
        assertEquals("CONCLUIDA", TaskStatus.CONCLUIDA.name());
    }
}
