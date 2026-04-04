package br.com.projeto.taskmanager.model;

public class Category {

    private Long id;
    private String nome;

    public Category() {
    }

    public Category(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public Category(String nome) {
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