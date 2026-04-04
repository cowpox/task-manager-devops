package br.com.projeto.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class TaskStatusUpdateDTO {

    @NotBlank(message = "O status é obrigatório.")
    @Pattern(
            regexp = "(?i)PENDENTE|EM_ANDAMENTO|CANCELADA|CONCLUIDA",
            message = "O status deve ser um destes valores: PENDENTE, EM_ANDAMENTO, CANCELADA, CONCLUIDA."
    )
    private String status;

    public TaskStatusUpdateDTO() {
    }

    public TaskStatusUpdateDTO(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}