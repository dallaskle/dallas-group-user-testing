create or replace function submit_validation(
  p_ticket_id uuid,
  p_feature_id uuid,
  p_tester_id uuid,
  p_status text,
  p_video_url text,
  p_notes text
) returns json
language plpgsql
security definer
as $$
declare
  v_validation_id uuid;
  v_feature_status text;
  v_required_validations int;
  v_current_validations int;
  v_ticket_record record;
begin
  -- Set the session user for audit logging
  PERFORM set_config('app.current_user_id', p_tester_id::text, true);

  -- Start transaction
  begin
    -- Insert validation
    insert into validations (
      feature_id,
      validated_by,
      status,
      video_url,
      notes
    ) values (
      p_feature_id,
      p_tester_id,
      p_status,
      p_video_url,
      p_notes
    ) returning id into v_validation_id;

    -- Update testing ticket with validation reference
    update testing_tickets
    set validation_id = v_validation_id
    where id = p_ticket_id;

    -- Update ticket status to resolved
    update tickets
    set status = 'resolved'
    where id = p_ticket_id
    returning * into v_ticket_record;

    -- Get validation counts
    select 
      required_validations,
      current_validations + 1
    into
      v_required_validations,
      v_current_validations
    from features
    where id = p_feature_id;

    -- Update feature status based on validation count
    if v_current_validations >= v_required_validations then
      -- Check if all validations are successful
      if not exists (
        select 1
        from validations
        where feature_id = p_feature_id
        and status = 'Needs Fixing'
      ) then
        v_feature_status := 'Successful Test';
      else
        v_feature_status := 'Failed Test';
      end if;

      -- Update feature status and validation count
      update features
      set 
        status = v_feature_status,
        current_validations = v_current_validations
      where id = p_feature_id;
    else
      -- Just update the validation count
      update features
      set current_validations = v_current_validations
      where id = p_feature_id;
    end if;

    -- Return success response
    return json_build_object(
      'success', true,
      'validation_id', v_validation_id,
      'ticket', v_ticket_record
    );
  exception
    when others then
      -- Rollback transaction on error
      raise exception 'Failed to submit validation: %', sqlerrm;
  end;
end;
$$;