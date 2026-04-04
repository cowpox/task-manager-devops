package br.com.projeto.taskmanager.service.impl;

import br.com.projeto.taskmanager.dto.PageResponseDTO;
import br.com.projeto.taskmanager.dto.TaskFilterDTO;
import br.com.projeto.taskmanager.exception.BusinessException;
import br.com.projeto.taskmanager.exception.ResourceNotFoundException;
import br.com.projeto.taskmanager.model.Task;
import br.com.projeto.taskmanager.model.TaskStatus;
import br.com.projeto.taskmanager.repository.CategoryRepository;
import br.com.projeto.taskmanager.repository.PageResult;
import br.com.projeto.taskmanager.repository.TaskRepository;
import br.com.projeto.taskmanager.service.TaskService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;

    public TaskServiceImpl(TaskRepository taskRepository, CategoryRepository categoryRepository) {
        this.taskRepository = taskRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Task> listarTodas() {
        return taskRepository.findAll();
    }

    @Override
    public PageResponseDTO<Task> listarComFiltros(TaskFilterDTO filter) {
        validarPaginacao(filter);

        PageResult<Task> result = taskRepository.findByFilters(filter);

        long totalElements = result.getTotalElements();
        int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / filter.getSize());

        return new PageResponseDTO<>(
                result.getContent(),
                filter.getPage(),
                filter.getSize(),
                totalElements,
                totalPages,
                filter.getPage() == 0,
                totalPages == 0 || filter.getPage() >= totalPages - 1
        );
    }

    @Override
    public Optional<Task> buscarPorId(Long id) {
        return taskRepository.findById(id);
    }

    @Override
    public Task criar(Task task) {
        validarTask(task);

        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDENTE);
        }

        if (task.getStatus() == TaskStatus.CONCLUIDA && task.getDataConclusao() == null) {
            task.setDataConclusao(LocalDateTime.now());
        }

        if (task.getStatus() != TaskStatus.CONCLUIDA) {
            task.setDataConclusao(null);
        }

        Long idGerado = taskRepository.save(task);
        return taskRepository.findById(idGerado)
                .orElseThrow(() -> new BusinessException("Tarefa foi salva, mas não pôde ser recuperada."));
    }

    @Override
    public Task atualizar(Task task) {
        if (task.getId() == null) {
            throw new BusinessException("O id da tarefa é obrigatório para atualização.");
        }

        taskRepository.findById(task.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada."));

        validarTask(task);

        if (task.getStatus() == TaskStatus.CONCLUIDA && task.getDataConclusao() == null) {
            task.setDataConclusao(LocalDateTime.now());
        }

        if (task.getStatus() != TaskStatus.CONCLUIDA) {
            task.setDataConclusao(null);
        }

        taskRepository.update(task);
        return task;
    }

    @Override
    public void excluir(Long id) {
        taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada."));

        taskRepository.delete(id);
    }

    @Override
    public Optional<Task> buscarPorTitulo(String titulo) {
        return taskRepository.findByTitulo(titulo);
    }

    @Override
    public List<Task> buscarPorStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    @Override
    public List<Task> buscarPorCategoria(Long categoriaId) {
        return taskRepository.findByCategoriaId(categoriaId);
    }

    private void validarPaginacao(TaskFilterDTO filter) {
        if (filter.getPage() < 0) {
            throw new BusinessException("O parâmetro page não pode ser negativo.");
        }

        if (filter.getSize() <= 0) {
            throw new BusinessException("O parâmetro size deve ser maior que zero.");
        }

        if (filter.getSize() > 100) {
            throw new BusinessException("O parâmetro size não pode ser maior que 100.");
        }
    }

    private void validarTask(Task task) {
        if (task == null) {
            throw new BusinessException("A tarefa não pode ser nula.");
        }

        if (task.getTitulo() == null || task.getTitulo().isBlank()) {
            throw new BusinessException("O título da tarefa é obrigatório.");
        }

        if (task.getCategoriaId() == null) {
            throw new BusinessException("A categoria da tarefa é obrigatória.");
        }

        if (categoryRepository.findById(task.getCategoriaId()).isEmpty()) {
            throw new BusinessException("A categoria informada não existe.");
        }

        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDENTE);
        }

        if (task.getDataCriacao() != null && task.getDataPrevistaConclusao() != null
                && task.getDataPrevistaConclusao().isBefore(task.getDataCriacao())) {
            throw new BusinessException("A data prevista de conclusão não pode ser anterior à data de criação.");
        }

        if (task.getDataCriacao() != null && task.getDataConclusao() != null
                && task.getDataConclusao().isBefore(task.getDataCriacao())) {
            throw new BusinessException("A data de conclusão não pode ser anterior à data de criação.");
        }
    }
}