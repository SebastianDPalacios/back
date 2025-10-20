-- Validación de transición de estado
CREATE OR REPLACE FUNCTION fn_can_transition_project(from_state text, to_state text)
RETURNS boolean AS $$
BEGIN
  IF from_state = 'CANCELADO' THEN RETURN FALSE; END IF;
  IF from_state = 'FINALIZADO' AND to_state <> 'CANCELADO' THEN RETURN FALSE; END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- SP cambio de estado con auditoría
CREATE OR REPLACE FUNCTION sp_change_project_state(p_project_id int, p_new_state text, p_actor_id int)
RETURNS void AS $$
DECLARE
  v_old_state text;
BEGIN
  SELECT estado::text INTO v_old_state FROM "Proyecto" WHERE id = p_project_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proyecto % no existe', p_project_id; END IF;

  IF NOT fn_can_transition_project(v_old_state, p_new_state) THEN
    RAISE EXCEPTION 'Transición inválida: % -> %', v_old_state, p_new_state;
  END IF;

  UPDATE "Proyecto"
     SET estado = p_new_state::"ProjectEstado", "actualizadoEn" = now()
   WHERE id = p_project_id;

  INSERT INTO "AuditLog"(tabla, accion, registroId, oldData, newData, actorId)
  VALUES ('Proyecto', 'STATE_CHANGE', p_project_id::text,
          jsonb_build_object('estado', v_old_state),
          jsonb_build_object('estado', p_new_state), p_actor_id);
END;
$$ LANGUAGE plpgsql;

-- Trigger de auditoría genérico
CREATE OR REPLACE FUNCTION trg_audit()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "AuditLog"(tabla, accion, registroId, newData)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id::text, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO "AuditLog"(tabla, accion, registroId, oldData, newData)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id::text, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSE
    INSERT INTO "AuditLog"(tabla, accion, registroId, oldData)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id::text, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_proyecto ON "Proyecto";
CREATE TRIGGER audit_proyecto
AFTER INSERT OR UPDATE OR DELETE ON "Proyecto"
FOR EACH ROW EXECUTE FUNCTION trg_audit();

DROP TRIGGER IF EXISTS audit_tarea ON "Tarea";
CREATE TRIGGER audit_tarea
AFTER INSERT OR UPDATE OR DELETE ON "Tarea"
FOR EACH ROW EXECUTE FUNCTION trg_audit();
