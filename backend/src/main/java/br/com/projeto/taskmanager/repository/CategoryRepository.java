package br.com.projeto.taskmanager.repository;

import br.com.projeto.taskmanager.model.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoryRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static class CategoryRowMapper implements RowMapper<Category> {
        @Override
        public Category mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
            Category category = new Category();
            category.setId(rs.getLong("id"));
            category.setNome(rs.getString("nome"));
            return category;
        }
    }

    public List<Category> findAll() {
        String sql = "SELECT * FROM categoria ORDER BY nome";
        return jdbcTemplate.query(sql, new CategoryRowMapper());
    }

    public Optional<Category> findById(Long id) {
        String sql = "SELECT * FROM categoria WHERE id = ?";

        try {
            Category category = jdbcTemplate.queryForObject(sql, new CategoryRowMapper(), id);
            return Optional.ofNullable(category);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Category> findByNome(String nome) {
        String sql = "SELECT * FROM categoria WHERE nome = ?";

        try {
            Category category = jdbcTemplate.queryForObject(sql, new CategoryRowMapper(), nome);
            return Optional.ofNullable(category);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Long save(Category category) {
        String sql = "INSERT INTO categoria (nome) VALUES (?) RETURNING id";

        return jdbcTemplate.queryForObject(
                sql,
                Long.class,
                category.getNome()
        );
    }

    public int update(Category category) {
        String sql = "UPDATE categoria SET nome = ? WHERE id = ?";
        return jdbcTemplate.update(sql, category.getNome(), category.getId());
    }

    public int delete(Long id) {
        String sql = "DELETE FROM categoria WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}