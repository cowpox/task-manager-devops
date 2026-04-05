package br.com.projeto.taskmanager.controller;

import br.com.projeto.taskmanager.dto.ApiResponseDTO;
import br.com.projeto.taskmanager.dto.PageResponseDTO;
import br.com.projeto.taskmanager.dto.TaskFilterDTO;
import br.com.projeto.taskmanager.dto.TaskRequestDTO;
import br.com.projeto.taskmanager.dto.TaskResponseDTO;
import br.com.projeto.taskmanager.dto.TaskStatusUpdateDTO;
import br.com.projeto.taskmanager.exception.ResourceNotFoundException;
import br.com.projeto.taskmanager.mapper.DtoMapper;
import br.com.projeto.taskmanager.model.Category;
import br.com.projeto.taskmanager.model.Task;
import br.com.projeto.taskmanager.model.TaskStatus;
import br.com.projeto.taskmanager.service.CategoryService;
import br.com.projeto.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tarefas")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;
    private final CategoryService categoryService;

    public TaskController(TaskService taskService, CategoryService categoryService) {
        this.taskService = taskService;
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<PageResponseDTO<TaskResponseDTO>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String titulo,
            @RequestParam(defaultValue = "dataCriacao") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        TaskFilterDTO filter = new TaskFilterDTO();
        filter.setPage(page);
        filter.setSize(size);
        filter.setCategoriaId(categoriaId);
        filter.setTitulo(titulo);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);

        if (status != null && !status.isBlank()) {
            filter.setStatus(TaskStatus.valueOf(status.trim().toUpperCase(Locale.ROOT)));
        }

        PageResponseDTO<Task> pageResult = taskService.listarComFiltros(filter);

        PageResponseDTO<TaskResponseDTO> response = new PageResponseDTO<>();
        response.setContent(
                pageResult.getContent()
                        .stream()
                        .map(this::toTaskResponseDTO)
                        .collect(Collectors.toList())
        );
        response.setPage(pageResult.getPage());
        response.setSize(pageResult.getSize());
        response.setTotalElements(pageResult.getTotalElements());
        response.setTotalPages(pageResult.getTotalPages());
        response.setFirst(pageResult.isFirst());
        response.setLast(pageResult.isLast());

        return ResponseEntity.ok(ApiResponseDTO.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<TaskResponseDTO>> buscarPorId(@PathVariable Long id) {
        Task task = taskService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada."));

        return ResponseEntity.ok(ApiResponseDTO.success(toTaskResponseDTO(task)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<TaskResponseDTO>> criar(@Valid @RequestBody TaskRequestDTO dto) {
        Category category = buscarCategoriaOuFalhar(dto.getCategoriaId());

        Task task = DtoMapper.toTask(dto, category);
        Task criada = taskService.criar(task);

        return ResponseEntity.ok(ApiResponseDTO.success("Tarefa criada com sucesso.", toTaskResponseDTO(criada)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<TaskResponseDTO>> atualizar(@PathVariable Long id,
                                                                     @Valid @RequestBody TaskRequestDTO dto) {
        taskService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada."));

        Category category = buscarCategoriaOuFalhar(dto.getCategoriaId());

        Task task = DtoMapper.toTask(dto, category);
        task.setId(id);

        Task atualizada = taskService.atualizar(task);

        return ResponseEntity.ok(ApiResponseDTO.success("Tarefa atualizada com sucesso.", toTaskResponseDTO(atualizada)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponseDTO<TaskResponseDTO>> atualizarStatus(@PathVariable Long id,
                                                                           @Valid @RequestBody TaskStatusUpdateDTO dto) {
        Task task = taskService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada."));

        task.setStatus(TaskStatus.valueOf(dto.getStatus().trim().toUpperCase(Locale.ROOT)));

        Task atualizada = taskService.atualizar(task);

        return ResponseEntity.ok(ApiResponseDTO.success("Status da tarefa atualizado com sucesso.", toTaskResponseDTO(atualizada)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> excluir(@PathVariable Long id) {
        taskService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada."));

        taskService.excluir(id);
        return ResponseEntity.ok(ApiResponseDTO.success("Tarefa excluída com sucesso.", null));
    }

    private Category buscarCategoriaOuFalhar(Long categoriaId) {
        return categoryService.buscarPorId(categoriaId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
    }

    private TaskResponseDTO toTaskResponseDTO(Task task) {
        Category category = null;

        if (task.getCategoriaId() != null) {
            category = categoryService.buscarPorId(task.getCategoriaId()).orElse(null);
        }

        return DtoMapper.toTaskResponseDTO(task, category);
    }
}