package br.com.projeto.taskmanager.service.impl;

import br.com.projeto.taskmanager.exception.BusinessException;
import br.com.projeto.taskmanager.exception.ResourceNotFoundException;
import br.com.projeto.taskmanager.model.Category;
import br.com.projeto.taskmanager.repository.CategoryRepository;
import br.com.projeto.taskmanager.repository.TaskRepository;
import br.com.projeto.taskmanager.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, TaskRepository taskRepository) {
        this.categoryRepository = categoryRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public List<Category> listarTodas() {
        return categoryRepository.findAll();
    }

    @Override
    public Optional<Category> buscarPorId(Long id) {
        return categoryRepository.findById(id);
    }

    @Override
    public Optional<Category> buscarPorNome(String nome) {
        return categoryRepository.findByNome(nome);
    }

    @Override
    public Category criar(Category category) {
        validarCategory(category);

        if (categoryRepository.findByNome(category.getNome()).isPresent()) {
            throw new BusinessException("Já existe uma categoria com esse nome.");
        }

        Long idGerado = categoryRepository.save(category);

        return categoryRepository.findById(idGerado)
                .orElseThrow(() -> new BusinessException("Categoria foi salva, mas não pôde ser recuperada."));
    }

    @Override
    public Category atualizar(Category category) {
        if (category.getId() == null) {
            throw new BusinessException("O id da categoria é obrigatório para atualização.");
        }

        categoryRepository.findById(category.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        validarCategory(category);

        Optional<Category> categoriaComMesmoNome = categoryRepository.findByNome(category.getNome());
        if (categoriaComMesmoNome.isPresent() && !categoriaComMesmoNome.get().getId().equals(category.getId())) {
            throw new BusinessException("Já existe outra categoria com esse nome.");
        }

        categoryRepository.update(category);
        return category;
    }

    @Override
    public void excluir(Long id) {
        categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        if (!taskRepository.findByCategoriaId(id).isEmpty()) {
            throw new BusinessException("Não é possível excluir a categoria porque existem tarefas vinculadas a ela.");
        }

        categoryRepository.delete(id);
    }

    private void validarCategory(Category category) {
        if (category == null) {
            throw new BusinessException("A categoria não pode ser nula.");
        }

        if (category.getNome() == null || category.getNome().isBlank()) {
            throw new BusinessException("O nome da categoria é obrigatório.");
        }
    }
}