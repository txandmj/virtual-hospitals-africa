import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createIndex('idx_snomed_rcv_type_value_source')
    .ifNotExists()
    .on('snomed_relationship_concrete_values')
    .columns(['type_id', 'value', 'source_id'])
    .execute()

  // For subqueries filtering on type_id + source_id and returning destination_id
  await db.schema
    .createIndex('idx_snomed_rel_type_source_dest')
    .ifNotExists()
    .on('snomed_relationship')
    .columns(['type_id', 'source_id', 'destination_id'])
    .execute()

  await sql`
    CREATE INDEX IF NOT EXISTS idx_snomed_relationship_source_destination 
    ON snomed_relationship(destination_id, source_id) 
  `.execute(db)

    // Create GIN trigram indexes for fast fuzzy search using pg_trgm
  await sql`
    CREATE INDEX trgm_snomed_description_term
    ON snomed_description
    USING GIN (term gin_trgm_ops)
  `.execute(db)

  await sql`
    CREATE INDEX trgm_snomed_inferred_canonical_name_and_category_name
    ON snomed_inferred_canonical_name_and_category
    USING GIN (name gin_trgm_ops)
  `.execute(db)

  // Covering index for the is_descendant recursive CTE join:
  // The function joins on source_id, filters by type_id = 116680003 and active = true,
  // and selects destination_id
  await sql`
    CREATE INDEX IF NOT EXISTS idx_snomed_relationship_isa_hierarchy
    ON snomed_relationship (source_id, destination_id)
    WHERE active = true AND type_id = 116680003
  `.execute(db)

  // Also index snomed_concept.active for the join in the CTE
  await sql`
    CREATE INDEX IF NOT EXISTS idx_snomed_concept_active
    ON snomed_concept (id)
    WHERE active = true
  `.execute(db)

  await db.schema
    .createIndex('snomed_inferred_canonical_name_and_category_name_category_idx')
    .on('snomed_inferred_canonical_name_and_category')
    .columns(['name', 'category'])
    .unique()
    .execute()

  await db.schema
    .createIndex('snomed_inferred_canonical_name_and_category_category_idx')
    .on('snomed_inferred_canonical_name_and_category')
    .column('category')
    .execute()
}

export async function down(_db: Kysely<DB>) {
}
