#!/bin/bash
# ─────────────────────────────────────────────────
# Phase 4 Integration Test — Validation, RBAC, Error Handling, Upload
# ─────────────────────────────────────────────────
set -e
BASE="http://localhost:5001"
TS=$(date +%s)

echo "══════════════════════════════════════"
echo "  1. Zod Validation Tests"
echo "══════════════════════════════════════"

echo -e "\n➤ 1a. Register with missing fields (expect 400 + validation errors)"
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":""}' | python3 -m json.tool

echo -e "\n➤ 1b. Register with invalid email (expect 400)"
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"notanemail","password":"123456"}' | python3 -m json.tool

echo -e "\n➤ 1c. Register with short password (expect 400)"
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","password":"12"}' | python3 -m json.tool

echo -e "\n➤ 1d. Login with missing password (expect 400)"
curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"x@x.com"}' | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  2. Valid Registration + Auth"
echo "══════════════════════════════════════"

echo -e "\n➤ 2a. Register Alice"
OWNER=$(curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice P4\",\"email\":\"alice_p4_${TS}@test.com\",\"password\":\"pass1234\"}")
echo "$OWNER" | python3 -m json.tool
OWNER_TOKEN=$(echo "$OWNER" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
OWNER_ID=$(echo "$OWNER" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['_id'])")

echo -e "\n➤ 2b. Register Bob"
MEMBER=$(curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Bob P4\",\"email\":\"bob_p4_${TS}@test.com\",\"password\":\"pass1234\"}")
MEMBER_TOKEN=$(echo "$MEMBER" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
MEMBER_ID=$(echo "$MEMBER" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['_id'])")
echo "✓ Bob registered"

echo -e "\n➤ 2c. GET /api/auth/me"
curl -s $BASE/api/auth/me -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

echo -e "\n➤ 2d. GET /api/protected"
curl -s $BASE/api/protected -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  3. Project Validation + CRUD"
echo "══════════════════════════════════════"

echo -e "\n➤ 3a. Create project with empty name (expect 400)"
curl -s -X POST $BASE/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":""}' | python3 -m json.tool

echo -e "\n➤ 3b. Create project (valid)"
PROJECT=$(curl -s -X POST $BASE/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":"Phase4 Project","description":"Testing production features"}')
echo "$PROJECT" | python3 -m json.tool
PROJECT_ID=$(echo "$PROJECT" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['_id'])")

echo -e "\n➤ 3c. Add Bob as member"
curl -s -X POST $BASE/api/projects/$PROJECT_ID/add-member \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d "{\"userId\":\"$MEMBER_ID\"}" | python3 -m json.tool

echo -e "\n➤ 3d. Add member with missing userId (expect 400)"
curl -s -X POST $BASE/api/projects/$PROJECT_ID/add-member \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{}' | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  4. Task Validation + CRUD"
echo "══════════════════════════════════════"

echo -e "\n➤ 4a. Create task with missing title (expect 400)"
curl -s -X POST $BASE/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d "{\"project\":\"$PROJECT_ID\"}" | python3 -m json.tool

echo -e "\n➤ 4b. Create task with invalid status (expect 400)"
curl -s -X POST $BASE/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d "{\"title\":\"Bad\",\"project\":\"$PROJECT_ID\",\"status\":\"invalid\"}" | python3 -m json.tool

echo -e "\n➤ 4c. Create task (valid)"
TASK=$(curl -s -X POST $BASE/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d "{\"title\":\"Production task\",\"project\":\"$PROJECT_ID\",\"assignedTo\":\"$MEMBER_ID\"}")
echo "$TASK" | python3 -m json.tool
TASK_ID=$(echo "$TASK" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['_id'])")

echo -e "\n➤ 4d. Update task with invalid status (expect 400)"
curl -s -X PUT $BASE/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"status":"broken"}' | python3 -m json.tool

echo -e "\n➤ 4e. Update task status (valid)"
curl -s -X PUT $BASE/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"status":"done"}' | python3 -m json.tool

echo -e "\n➤ 4f. Get tasks for project"
curl -s $BASE/api/tasks/project/$PROJECT_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  5. Phase 3 Regression (Activity + Notifications)"
echo "══════════════════════════════════════"

echo -e "\n➤ 5a. Activity log"
curl -s $BASE/api/activity/project/$PROJECT_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" | python3 -m json.tool

echo -e "\n➤ 5b. Bob's notifications"
curl -s $BASE/api/notifications \
  -H "Authorization: Bearer $MEMBER_TOKEN" | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  6. Global Error Handler"
echo "══════════════════════════════════════"

echo -e "\n➤ 6a. Invalid ObjectId (triggers cast error → error handler)"
curl -s -X PUT $BASE/api/tasks/invalid-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"status":"done"}' | python3 -m json.tool

echo ""
echo "══════════════════════════════════════"
echo "  ✅ ALL PHASE 4 TESTS COMPLETE"
echo "══════════════════════════════════════"
