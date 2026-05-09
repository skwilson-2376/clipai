#!/usr/bin/env bash
# Azure MySQL Flexible Server — one-time setup for ClipAI
# Run: bash azure-setup.sh
# Requires: az CLI logged in (`az login`)
set -euo pipefail

# ── Config (edit before running) ──────────────────────────────────────────────
RESOURCE_GROUP="clipai-rg"
LOCATION="eastus"
SERVER_NAME="clipai-mysql-$(openssl rand -hex 4)"   # globally unique name
DB_NAME="clipaiapp"
ADMIN_USER="clipaiadmin"
ADMIN_PASS="ClipAI@$(openssl rand -hex 6)!"          # auto-generated password
SKU="Standard_B1ms"       # cheapest tier — upgrade for production

# ── Step 1: Resource Group ─────────────────────────────────────────────────────
echo "▸ Creating resource group '$RESOURCE_GROUP' in '$LOCATION'…"
az group create \
  --name     "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output   none

# ── Step 2: MySQL Flexible Server ─────────────────────────────────────────────
echo "▸ Creating MySQL Flexible Server '$SERVER_NAME'…"
echo "  (this takes ~3–5 minutes)"
az mysql flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name           "$SERVER_NAME" \
  --location       "$LOCATION" \
  --admin-user     "$ADMIN_USER" \
  --admin-password "$ADMIN_PASS" \
  --sku-name       "$SKU" \
  --tier           Burstable \
  --version        8.0.21 \
  --storage-size   32 \
  --public-access  None \
  --output         none

# ── Step 3: Create the database ───────────────────────────────────────────────
echo "▸ Creating database '$DB_NAME'…"
az mysql flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name    "$SERVER_NAME" \
  --database-name  "$DB_NAME" \
  --output         none

# ── Step 4: Firewall rules ────────────────────────────────────────────────────
echo "▸ Adding firewall rule for Azure services…"
az mysql flexible-server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --name           "$SERVER_NAME" \
  --rule-name      "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address   0.0.0.0 \
  --output none

echo "▸ Adding firewall rule for your current IP…"
MY_IP=$(curl -s https://api.ipify.org)
az mysql flexible-server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --name           "$SERVER_NAME" \
  --rule-name      "AllowDevMachine" \
  --start-ip-address "$MY_IP" \
  --end-ip-address   "$MY_IP" \
  --output none

# ── Step 5: Get FQDN and print connection string ──────────────────────────────
FQDN=$(az mysql flexible-server show \
  --resource-group "$RESOURCE_GROUP" \
  --name           "$SERVER_NAME" \
  --query          fullyQualifiedDomainName \
  --output         tsv)

CONNECTION_STRING="mysql://${ADMIN_USER}:${ADMIN_PASS}@${FQDN}/${DB_NAME}?ssl-mode=require"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Azure MySQL Flexible Server created successfully!"
echo "═══════════════════════════════════════════════════════"
echo "  Server:   $SERVER_NAME"
echo "  Host:     $FQDN"
echo "  Database: $DB_NAME"
echo "  User:     $ADMIN_USER"
echo "  Password: $ADMIN_PASS"
echo ""
echo "  Add this to backend/.env:"
echo ""
echo "  DATABASE_URL=$CONNECTION_STRING"
echo "═══════════════════════════════════════════════════════"

# Save to .env automatically
BACKEND_ENV="$(dirname "$0")/.env"
if [ -f "$BACKEND_ENV" ]; then
  echo ""
  echo "  .env already exists — add the DATABASE_URL manually."
else
  cp "$(dirname "$0")/.env.example" "$BACKEND_ENV"
  sed -i "s|DATABASE_URL=.*|DATABASE_URL=$CONNECTION_STRING|" "$BACKEND_ENV"
  echo "  Saved to backend/.env ✓"
fi
