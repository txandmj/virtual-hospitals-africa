#! /usr/bin/env bash

ps aux | grep 'deno task vite' | grep -v grep | awk '{ print $2 }' | xargs kill || true
ps aux | grep 'deno task proxy' | grep -v grep | awk '{ print $2 }' | xargs kill || true
ps aux | grep 'deno task events:processor' | grep -v grep | awk '{ print $2 }' | xargs kill || true