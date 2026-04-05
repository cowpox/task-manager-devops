package br.com.projeto.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class TaskRequestDTO {

    @NotBlank(message = "O título é obrigatório.")
    @Size(max = 100, message = "O título deve ter no máximo 100 caracteres.")
    private String titulo;

    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
    private String descricao;

    @Pattern(
            regexp = "(?i)PENDENTE|EM_ANDAMENTO|CANCELADA|CONCLUIDA",
            message = "O status deve ser um destes valores: PENDENTE, EM_ANDAMENTO, CANCELADA, CONCLUIDA."
    )
    private String status;

    @NotNull(message = "O id da categoria é obrigatório.")
    @Positive(message = "O id da categoria deve ser maior que zero.")
    private Long categoriaId;

    private LocalDateTime dataPrevistaConclusao;

    public TaskRequestDTO() {
    }

    public TaskRequestDTO(String titulo, String descricao, String status, Long categoriaId, LocalDateTime dataPrevistaConclusao) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.status = status;
        this.categoriaId = categoriaId;
        this.dataPrevistaConclusao = dataPrevistaConclusao;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public LocalDateTime getDataPrevistaConclusao() {
        return dataPrevistaConclusao;
    }

    public void setDataPrevistaConclusao(LocalDateTime dataPrevistaConclusao) {
        this.dataPrevistaConclusao = dataPrevistaConclusao;
    }
}