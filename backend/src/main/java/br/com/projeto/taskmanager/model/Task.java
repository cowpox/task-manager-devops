package br.com.projeto.taskmanager.model;

import java.time.LocalDateTime;

public class Task {

    private Long id;
    private String titulo;
    private String descricao;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataPrevistaConclusao;
    private LocalDateTime dataConclusao;
    private TaskStatus status;
    private Long categoriaId;

    public Task() {
    }

    public Task(Long id, String titulo, String descricao, LocalDateTime dataCriacao,
                LocalDateTime dataPrevistaConclusao, LocalDateTime dataConclusao,
                TaskStatus status, Long categoriaId) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.dataCriacao = dataCriacao;
        this.dataPrevistaConclusao = dataPrevistaConclusao;
        this.dataConclusao = dataConclusao;
        this.status = status;
        this.categoriaId = categoriaId;
    }

    public Task(String titulo, String descricao, LocalDateTime dataPrevistaConclusao,
                TaskStatus status, Long categoriaId) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.dataPrevistaConclusao = dataPrevistaConclusao;
        this.status = status;
        this.categoriaId = categoriaId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataPrevistaConclusao() {
        return dataPrevistaConclusao;
    }

    public void setDataPrevistaConclusao(LocalDateTime dataPrevistaConclusao) {
        this.dataPrevistaConclusao = dataPrevistaConclusao;
    }

    public LocalDateTime getDataConclusao() {
        return dataConclusao;
    }

    public void setDataConclusao(LocalDateTime dataConclusao) {
        this.dataConclusao = dataConclusao;
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
}