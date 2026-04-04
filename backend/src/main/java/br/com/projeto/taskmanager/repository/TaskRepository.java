package br.com.projeto.taskmanager.repository;

import br.com.projeto.taskmanager.dto.TaskFilterDTO;
import br.com.projeto.taskmanager.exception.BusinessException;
import br.com.projeto.taskmanager.model.Task;
import br.com.projeto.taskmanager.model.TaskStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class TaskRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final Map<String, String> SORT_COLUMNS = Map.of(
            "id", "id",
            "titulo", "titulo",
            "status", "status",
            "dataCriacao", "data_criacao",
            "dataPrevistaConclusao", "data_prevista_conclusao",
            "dataConclusao", "data_conclusao"
    );

    private static class TaskRowMapper implements RowMapper<Task> {
        @Override
        public Task mapRow(ResultSet rs, int rowNum) throws SQLException {
            Task task = new Task();

            task.setId(rs.getLong("id"));
            task.setTitulo(rs.getString("titulo"));
            task.setDescricao(rs.getString("descricao"));

            Timestamp dataCriacao = rs.getTimestamp("data_criacao");
            if (dataCriacao != null) {
                task.setDataCriacao(dataCriacao.toLocalDateTime());
            }

            Timestamp dataPrevistaConclusao = rs.getTimestamp("data_prevista_conclusao");
            if (dataPrevistaConclusao != null) {
                task.setDataPrevistaConclusao(dataPrevistaConclusao.toLocalDateTime());
            }

            Timestamp dataConclusao = rs.getTimestamp("data_conclusao");
            if (dataConclusao != null) {
                task.setDataConclusao(dataConclusao.toLocalDateTime());
            }

            task.setStatus(TaskStatus.valueOf(rs.getString("status")));
            task.setCategoriaId(rs.getLong("categoria_id"));

            return task;
        }
    }

    public List<Task> findAll() {
        String sql = "SELECT * FROM tarefa ORDER BY data_criacao DESC";
        return jdbcTemplate.query(sql, new TaskRowMapper());
    }

    public Optional<Task> findById(Long id) {
        String sql = "SELECT * FROM tarefa WHERE id = ?";

        try {
            Task task = jdbcTemplate.queryForObject(sql, new TaskRowMapper(), id);
            return Optional.ofNullable(task);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Long save(Task task) {
        String sql = """
            INSERT INTO tarefa
            (titulo, descricao, status, categoria_id, data_prevista_conclusao, data_conclusao)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id
            """;

        return jdbcTemplate.queryForObject(
                sql,
                Long.class,
                task.getTitulo(),
                task.getDescricao(),
                task.getStatus().name(),
                task.getCategoriaId(),
                task.getDataPrevistaConclusao(),
                task.getDataConclusao()
        );
    }

    public int update(Task task) {
        String sql = """
                UPDATE tarefa
                SET titulo = ?,
                    descricao = ?,
                    status = ?,
                    categoria_id = ?,
                    data_prevista_conclusao = ?,
                    data_conclusao = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(
                sql,
                task.getTitulo(),
                task.getDescricao(),
                task.getStatus().name(),
                task.getCategoriaId(),
                task.getDataPrevistaConclusao(),
                task.getDataConclusao(),
                task.getId()
        );
    }

    public int delete(Long id) {
        String sql = "DELETE FROM tarefa WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public Optional<Task> findByTitulo(String titulo) {
        String sql = "SELECT * FROM tarefa WHERE titulo = ?";

        try {
            Task task = jdbcTemplate.queryForObject(sql, new TaskRowMapper(), titulo);
            return Optional.ofNullable(task);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Task> findByStatus(TaskStatus status) {
        String sql = "SELECT * FROM tarefa WHERE status = ? ORDER BY data_criacao DESC";
        return jdbcTemplate.query(sql, new TaskRowMapper(), status.name());
    }

    public List<Task> findByCategoriaId(Long categoriaId) {
        String sql = "SELECT * FROM tarefa WHERE categoria_id = ? ORDER BY data_criacao DESC";
        return jdbcTemplate.query(sql, new TaskRowMapper(), categoriaId);
    }

    public PageResult<Task> findByFilters(TaskFilterDTO filter) {
        String sortColumn = resolveSortColumn(filter.getSortBy());
        String sortDirection = resolveSortDirection(filter.getSortDir());

        StringBuilder baseSql = new StringBuilder(" FROM tarefa WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (filter.getStatus() != null) {
            baseSql.append(" AND status = ? ");
            params.add(filter.getStatus().name());
        }

        if (filter.getCategoriaId() != null) {
            baseSql.append(" AND categoria_id = ? ");
            params.add(filter.getCategoriaId());
        }

        if (filter.getTitulo() != null && !filter.getTitulo().isBlank()) {
            baseSql.append(" AND LOWER(titulo) LIKE ? ");
            params.add("%" + filter.getTitulo().trim().toLowerCase() + "%");
        }

        String countSql = "SELECT COUNT(*)" + baseSql;
        Long totalElements = jdbcTemplate.queryForObject(countSql, Long.class, params.toArray());

        String dataSql = "SELECT *" + baseSql +
                " ORDER BY " + sortColumn + " " + sortDirection +
                " LIMIT ? OFFSET ? ";

        List<Object> dataParams = new ArrayList<>(params);
        dataParams.add(filter.getSize());
        dataParams.add(filter.getPage() * filter.getSize());

        List<Task> content = jdbcTemplate.query(dataSql, new TaskRowMapper(), dataParams.toArray());

        return new PageResult<>(content, totalElements != null ? totalElements : 0L);
    }

    private String resolveSortColumn(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "data_criacao";
        }

        String column = SORT_COLUMNS.get(sortBy);
        if (column == null) {
            throw new BusinessException("Campo de ordenação inválido: " + sortBy);
        }

        return column;
    }

    private String resolveSortDirection(String sortDir) {
        if (sortDir == null || sortDir.isBlank()) {
            return "DESC";
        }

        String normalized = sortDir.trim().toUpperCase();
        if (!normalized.equals("ASC") && !normalized.equals("DESC")) {
            throw new BusinessException("Direção de ordenação inválida. Use ASC ou DESC.");
        }

        return normalized;
    }
}