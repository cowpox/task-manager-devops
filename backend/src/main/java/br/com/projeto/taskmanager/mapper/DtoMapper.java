package br.com.projeto.taskmanager.mapper;

import br.com.projeto.taskmanager.dto.CategoryResponseDTO;
import br.com.projeto.taskmanager.dto.TaskRequestDTO;
import br.com.projeto.taskmanager.dto.TaskResponseDTO;
import br.com.projeto.taskmanager.model.Category;
import br.com.projeto.taskmanager.model.Task;
import br.com.projeto.taskmanager.model.TaskStatus;

import java.util.Locale;

public class DtoMapper {

    private DtoMapper() {
    }

    public static CategoryResponseDTO toCategoryResponseDTO(Category category) {
        if (category == null) {
            return null;
        }

        return new CategoryResponseDTO(
                category.getId(),
                category.getNome()
        );
    }

    public static TaskResponseDTO toTaskResponseDTO(Task task, Category category) {
        if (task == null) {
            return null;
        }

        return new TaskResponseDTO(
                task.getId(),
                task.getTitulo(),
                task.getDescricao(),
                task.getDataCriacao(),
                task.getDataPrevistaConclusao(),
                task.getDataConclusao(),
                task.getStatus() != null ? task.getStatus().name() : null,
                toCategoryResponseDTO(category)
        );
    }

    public static Task toTask(TaskRequestDTO dto, Category category) {
        if (dto == null) {
            return null;
        }

        Task task = new Task();
        task.setTitulo(dto.getTitulo());
        task.setDescricao(dto.getDescricao());
        task.setDataPrevistaConclusao(dto.getDataPrevistaConclusao());
        task.setCategoriaId(category != null ? category.getId() : null);

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            task.setStatus(TaskStatus.valueOf(dto.getStatus().trim().toUpperCase(Locale.ROOT)));
        }

        return task;
    }
}