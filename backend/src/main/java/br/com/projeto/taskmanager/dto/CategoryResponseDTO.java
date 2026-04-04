package br.com.projeto.taskmanager.dto;

public class CategoryResponseDTO {

    private Long id;
    private String nome;

    public CategoryResponseDTO() {
    }

    public CategoryResponseDTO(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}