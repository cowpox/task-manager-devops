package br.com.projeto.taskmanager.service;

import br.com.projeto.taskmanager.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryService {

    List<Category> listarTodas();

    Optional<Category> buscarPorId(Long id);

    Optional<Category> buscarPorNome(String nome);

    Category criar(Category category);

    Category atualizar(Category category);

    void excluir(Long id);
}