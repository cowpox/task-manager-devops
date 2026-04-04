package br.com.projeto.taskmanager.service;

import br.com.projeto.taskmanager.dto.PageResponseDTO;
import br.com.projeto.taskmanager.dto.TaskFilterDTO;
import br.com.projeto.taskmanager.model.Task;
import br.com.projeto.taskmanager.model.TaskStatus;

import java.util.List;
import java.util.Optional;

public interface TaskService {

    List<Task> listarTodas();

    PageResponseDTO<Task> listarComFiltros(TaskFilterDTO filter);

    Optional<Task> buscarPorId(Long id);

    Task criar(Task task);

    Task atualizar(Task task);

    void excluir(Long id);

    Optional<Task> buscarPorTitulo(String titulo);

    List<Task> buscarPorStatus(TaskStatus status);

    List<Task> buscarPorCategoria(Long categoriaId);
}