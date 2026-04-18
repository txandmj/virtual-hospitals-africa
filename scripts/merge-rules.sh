#!/usr/bin/env bash
set -euo pipefail

# mkdir s_expression/apc-adult

for f in s_expression/tasks/apc-adult/*; do
  name=$(basename "$f")
  cat "$f" >> "s_expression/apc-adult/$name"
done

for f in s_expression/system_diagnosis_rules/apc-adult/*; do
  name=$(basename "$f")
  cat "$f" >> "s_expression/apc-adult/$name"
done

for f in s_expression/system_priority_evaluations/apc-adult/*; do
  name=$(basename "$f")
  cat "$f" >> "s_expression/apc-adult/$name"
done
