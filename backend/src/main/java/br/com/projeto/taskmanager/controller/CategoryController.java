package br.com.projeto.taskmanager.controller;

import br.com.projeto.taskmanager.dto.ApiResponseDTO;
import br.com.projeto.taskmanager.dto.CategoryRequestDTO;
import br.com.projeto.taskmanager.dto.CategoryResponseDTO;
import br.com.projeto.taskmanager.exception.ResourceNotFoundException;
import br.com.projeto.taskmanager.mapper.DtoMapper;
import br.com.projeto.taskmanager.model.Category;
import br.com.projeto.taskmanager.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<CategoryResponseDTO>>> listarTodas() {
        List<CategoryResponseDTO> response = categoryService.listarTodas()
                .stream()
                .map(DtoMapper::toCategoryResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponseDTO.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<CategoryResponseDTO>> buscarPorId(@PathVariable Long id) {
        Category category = categoryService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        return ResponseEntity.ok(ApiResponseDTO.success(DtoMapper.toCategoryResponseDTO(category)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<CategoryResponseDTO>> criar(@Valid @RequestBody CategoryRequestDTO dto) {
        Category category = new Category();
        category.setNome(dto.getNome());

        Category criada = categoryService.criar(category);

        return ResponseEntity.ok(ApiResponseDTO.success("Categoria criada com sucesso.", DtoMapper.toCategoryResponseDTO(criada)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<CategoryResponseDTO>> atualizar(@PathVariable Long id,
                                                                         @Valid @RequestBody CategoryRequestDTO dto) {
        Category category = categoryService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        category.setNome(dto.getNome());

        Category atualizada = categoryService.atualizar(category);

        return ResponseEntity.ok(ApiResponseDTO.success("Categoria atualizada com sucesso.", DtoMapper.toCategoryResponseDTO(atualizada)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> excluir(@PathVariable Long id) {
        categoryService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        categoryService.excluir(id);
        return ResponseEntity.ok(ApiResponseDTO.success("Categoria excluída com sucesso.", null));
    }
}