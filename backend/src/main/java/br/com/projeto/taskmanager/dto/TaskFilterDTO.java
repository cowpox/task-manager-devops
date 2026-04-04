package br.com.projeto.taskmanager.dto;

import br.com.projeto.taskmanager.model.TaskStatus;

public class TaskFilterDTO {

    private TaskStatus status;
    private Long categoriaId;
    private String titulo;
    private int page;
    private int size;
    private String sortBy;
    private String sortDir;

    public TaskFilterDTO() {
    }

    public TaskFilterDTO(TaskStatus status, Long categoriaId, String titulo, int page, int size, String sortBy, String sortDir) {
        this.status = status;
        this.categoriaId = categoriaId;
        this.titulo = titulo;
        this.page = page;
        this.size = size;
        this.sortBy = sortBy;
        this.sortDir = sortDir;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDir() {
        return sortDir;
    }

    public void setSortDir(String sortDir) {
        this.sortDir = sortDir;
    }
}