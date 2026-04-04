package br.taskmanager.repository;

import br.taskmanager.model.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class taskmanagerRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // RowMapper para converter ResultSet em objeto Tarefa. Isso evita a busca de coluna por coluna.
    private static class TarefaRowMapper implements RowMapper<Task> {
        @Override
        public Task mapRow(ResultSet rs, int rowNum) throws SQLException {
            Task task = new Task();
            task.setId(rs.getLong("id"));
            task.setTitulo(rs.getString("titulo"));
            task.setDescricao(rs.getString("descricao"));
            task.setDataCriacao(rs.getTimestamp("data_criacao").toLocalDateTime());
            task.setDataPrevistaConclusao(rs.getTimestamp("data_prevista_conclusao") != null
                    ? rs.getTimestamp("data_prevista_conclusao").toLocalDateTime() : null);
            task.setDataConclusao(rs.getTimestamp("data_conclusao") != null
                    ? rs.getTimestamp("data_conclusao").toLocalDateTime() : null);
            task.setStatus(rs.getString("status"));
            task.setCategoriaId(rs.getLong("categoria_id"));
            return task;
        }
    }

    //CRUD _______________________________________________________________

    //READ (VIZUALIZAR)____________________________________________________________________
    // Busca todas as tarefas
    public List<Task> findAll() {
        String sql = "SELECT * FROM tarefa ORDER BY data_criacao DESC";
        return jdbcTemplate.query(sql, new TarefaRowMapper());
    }

    // Busca tarefa por ID
    public Optional<Task> findById(Long id) {
        String sql = "SELECT * FROM tarefa WHERE id = ?";
        try {
            Task tarefa = jdbcTemplate.queryForObject(sql, new TarefaRowMapper(), id);
            return Optional.ofNullable(tarefa);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    //CREATE (CRIAR/NOVAR)______________________________________________________________________
    // Insere nova tarefa
    public int save(Task task) {
        String sql = "INSERT INTO tarefa (titulo, descricao, status, categoria_id, data_prevista_conclusao) " +
                "VALUES (?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                task.getTitulo(),
                task.getDescricao(),
                task.getStatus(),
                task.getCategoriaId(),
                task.getDataPrevistaConclusao());
    }

    //UPDATE(ATUALIZAR)______________________________________________________________________
    // Atualiza tarefa existente
    public int update(Task tarefa) {
        String sql = "UPDATE  SET titulo = ?, descricao = ?, status = ?, " +
                "data_prevista_conclusao = ?, data_conclusao = ?, categoria_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                task.getTitulo(),
                task.getDescricao(),
                task.getStatus(),
                task.getDataPrevistaConclusao(),
                task.getDataConclusao(),
                task.getCategoriaId(),
                task.getId());
    }

    //DELETE(APAGAR)______________________________________________________________________
    // Remove tarefa por ID
    public int delete(Long id) {
        String sql = "DELETE FROM tarefa WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }



    //FUNCIONALIDADES DERIVADAS/EXTRAS____________________________________________________
    //Busca tarefa por título, logo retorna um objeto
    public Task searchTitle(String title) {
        String sql = "SELECT * FROM tarefa WHERE titulo = ?";
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            Task tarefa = new Task();
            tarefa.setId(rs.getLong("id"));
            tarefa.setTitulo(rs.getString("titulo"));
            tarefa.setDescricao(rs.getString("descricao"));
            tarefa.setStatus(rs.getString("status"));
            tarefa.setCategoriaId(rs.getLong("categoria_id"));
            return tarefa;
        }, title);
    }

    // Buscar por status, logo retorna uma lista
    public List<Task> searchStatus(String status) {
        String sql = "SELECT * FROM tarefa WHERE status = ?";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Task task = new Task();
            task.setId(rs.getLong("id"));
            task.setTitulo(rs.getString("titulo"));
            task.setStatus(rs.getString("status"));
            return task;
        }, status);
    }

}
