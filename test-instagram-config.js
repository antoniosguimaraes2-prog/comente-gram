// Script simples para testar a configuração do Instagram
// Execute com: node test-instagram-config.js

const SUPABASE_URL = 'https://htwwbtqsdhibxkrdfvsm.supabase.co';

async function testInstagramConfig() {
  console.log('🧪 Testando configuração do Instagram...\n');

  try {
    // Test 1: Check if the edge function exists
    console.log('📡 Testando Edge Function...');
    const response = await fetch(`${SUPABASE_URL}/functions/v1/instagram-oauth-start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // Will fail but tells us about config
      }
    });

    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);

    if (response.status === 401) {
      console.log('✅ Edge Function existe (erro de autenticação é esperado)');
    } else if (response.status === 500) {
      if (result.includes('META_APP_ID not configured')) {
        console.log('❌ META_APP_ID não está configurado');
        console.log('\n💡 Para corrigir:');
        console.log('1. Acesse o Supabase Dashboard');
        console.log('2. Vá para Settings → Environment Variables');
        console.log('3. Adicione: META_APP_ID e META_APP_SECRET');
      } else {
        console.log('❌ Erro na configuração:', result);
      }
    } else {
      console.log('✅ Edge Function respondeu:', result);
    }

  } catch (error) {
    console.error('❌ Erro ao testar configuração:', error.message);
  }

  console.log('\n📋 Checklist de configuração:');
  console.log('□ App criado no Meta for Developers');
  console.log('□ META_APP_ID configurado no Supabase');
  console.log('□ META_APP_SECRET configurado no Supabase');
  console.log('□ URIs de redirecionamento configurados no Meta');
  console.log('□ Permissões do Instagram configuradas');
  console.log('\n📖 Consulte INSTAGRAM_SETUP.md para instruções detalhadas');
}

testInstagramConfig();
