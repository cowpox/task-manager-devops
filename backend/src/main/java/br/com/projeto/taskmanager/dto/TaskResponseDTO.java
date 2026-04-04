package br.com.projeto.taskmanager.dto;

import java.time.LocalDateTime;

public class TaskResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataPrevistaConclusao;
    private LocalDateTime dataConclusao;
    private String status;
    private CategoryResponseDTO categoria;

    public TaskResponseDTO() {
    }

    public TaskResponseDTO(Long id, String titulo, String descricao, LocalDateTime dataCriacao,
                           LocalDateTime dataPrevistaConclusao, LocalDateTime dataConclusao,
                           String status, CategoryResponseDTO categoria) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.dataCriacao = dataCriacao;
        this.dataPrevistaConclusao = dataPrevistaConclusao;
        this.dataConclusao = dataConclusao;
        this.status = status;
        this.categoria = categoria;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public CategoryResponseDTO getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoryResponseDTO categoria) {
        this.categoria = categoria;
    }
}