#!/bin/bash
# ─────────────────────────────────────────────────
# Phase 2 Integration Test Script
# ─────────────────────────────────────────────────
set -e
BASE="http://localhost:5050"

echo "══════════════════════════════════════"
echo "  Phase 1 — Auth (regression check)"
echo "══════════════════════════════════════"

# Register owner
echo -e "\n➤ Register owner (Alice)"
OWNER=$(curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Owner","email":"alice_p2@test.com","password":"pass1234"}')
echo "$OWNER" | python3 -m json.tool
OWNER_TOKEN=$(echo "$OWNER" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
OWNER_ID=$(echo "$OWNER" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['_id'])")

# Register member
echo -e "\n➤ Register member (Bob)"
MEMBER=$(curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Member","email":"bob_p2@test.com","password":"pass1234"}')
echo "$MEMBER" | python3 -m json.tool
MEMBER_TOKEN=$(echo "$MEMBER" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
MEMBER_ID=$(echo "$MEMBER" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['_id'])")

echo -e "\n➤ GET /api/auth/me (owner)"
curl -s $BASE/api/auth/me -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  Phase 2 — Projects"
echo "══════════════════════════════════════"

# 1. Create project
echo -e "\n➤ 1. Create project"
PROJECT=$(curl -s -X POST $BASE/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":"TaskFlow MVP","description":"Phase 2 test project"}')
echo "$PROJECT" | python3 -m json.tool
PROJECT_ID=$(echo "$PROJECT" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['_id'])")

# 2. List projects (owner sees it)
echo -e "\n➤ 2. List projects (owner)"
curl -s $BASE/api/projects -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

# 3. Get single project
echo -e "\n➤ 3. Get single project"
curl -s $BASE/api/projects/$PROJECT_ID -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

# 4. Add member
echo -e "\n➤ 4. Add Bob as member"
curl -s -X POST $BASE/api/projects/$PROJECT_ID/add-member \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d "{\"userId\":\"$MEMBER_ID\"}" | python3 -m json.tool

# 5. Duplicate member (should fail)
echo -e "\n➤ 5. Add Bob again (expect 400)"
curl -s -X POST $BASE/api/projects/$PROJECT_ID/add-member \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d "{\"userId\":\"$MEMBER_ID\"}" | python3 -m json.tool

# 6. Non-owner tries to add member (should fail)
echo -e "\n➤ 6. Bob tries to add member (expect 403)"
curl -s -X POST $BASE/api/projects/$PROJECT_ID/add-member \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d "{\"userId\":\"$OWNER_ID\"}" | python3 -m json.tool

# 7. Update project
echo -e "\n➤ 7. Update project name (owner)"
curl -s -X PUT $BASE/api/projects/$PROJECT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":"TaskFlow MVP v2"}' | python3 -m json.tool

# 8. Bob tries to update (should fail)
echo -e "\n➤ 8. Bob tries to update project (expect 403)"
curl -s -X PUT $BASE/api/projects/$PROJECT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{"name":"Hijacked"}' | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  Phase 2 — Tasks"
echo "══════════════════════════════════════"

# 9. Create task (owner)
echo -e "\n➤ 9. Create task (owner)"
TASK=$(curl -s -X POST $BASE/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d "{\"title\":\"Setup CI/CD\",\"description\":\"Configure pipelines\",\"project\":\"$PROJECT_ID\"}")
echo "$TASK" | python3 -m json.tool
TASK_ID=$(echo "$TASK" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['_id'])")

# 10. Create task assigned to Bob
echo -e "\n➤ 10. Create task assigned to Bob"
TASK2=$(curl -s -X POST $BASE/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d "{\"title\":\"Write tests\",\"project\":\"$PROJECT_ID\",\"assignedTo\":\"$MEMBER_ID\"}")
echo "$TASK2" | python3 -m json.tool
TASK2_ID=$(echo "$TASK2" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['_id'])")

# 11. List tasks for project
echo -e "\n➤ 11. List tasks for project"
curl -s $BASE/api/tasks/project/$PROJECT_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

# 12. Update task status
echo -e "\n➤ 12. Update task status to in-progress"
curl -s -X PUT $BASE/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"status":"in-progress"}' | python3 -m json.tool

# 13. Bob updates his task to done
echo -e "\n➤ 13. Bob marks his task as done"
curl -s -X PUT $BASE/api/tasks/$TASK2_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -d '{"status":"done"}' | python3 -m json.tool

# 14. Bob tries to delete owner's task (should fail)
echo -e "\n➤ 14. Bob tries to delete owner's task (expect 403)"
curl -s -X DELETE $BASE/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $MEMBER_TOKEN" | python3 -m json.tool

# 15. Owner deletes task
echo -e "\n➤ 15. Owner deletes task"
curl -s -X DELETE $BASE/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  Phase 1 — Protected route (regression)"
echo "══════════════════════════════════════"
echo -e "\n➤ Protected route"
curl -s $BASE/api/protected -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  ✅ ALL TESTS COMPLETE"
echo "══════════════════════════════════════"
