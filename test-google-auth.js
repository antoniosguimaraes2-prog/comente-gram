/**
 * Script de teste para verificar configuração do Google OAuth
 * Execute com: node test-google-auth.js
 */

const { createClient } = require('@supabase/supabase-js');

// Substitua pelas suas configurações
const SUPABASE_URL = 'https://seu-projeto-id.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testGoogleOAuth() {
  console.log('🔍 Testando configuração do Google OAuth...\n');
  
  try {
    console.log('📡 Conectando ao Supabase...');
    console.log(`URL: ${SUPABASE_URL}`);
    
    // Tenta inicializar OAuth sem redirecionamento
    console.log('\n🔐 Testando Google OAuth...');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/campaigns',
        skipBrowserRedirect: true
      }
    });

    if (error) {
      console.log('❌ Erro encontrado:');
      console.log(`   Código: ${error.message}`);
      
      if (error.message.includes('OAuth') || error.message.includes('provider')) {
        console.log('\n💡 Diagnóstico:');
        console.log('   ❌ Google OAuth não está configurado no Supabase');
        console.log('\n🔧 Para corrigir:');
        console.log(`   1. Acesse: https://app.supabase.com/project/${extractProjectId(SUPABASE_URL)}/auth/providers`);
        console.log('   2. Ative o Google provider');
        console.log('   3. Configure Client ID e Client Secret do Google Console');
        console.log('   4. Configure a URL de callback:');
        console.log(`      ${SUPABASE_URL}/auth/v1/callback`);
      } else {
        console.log('\n💡 Outro erro:', error.message);
      }
      
      return false;
    }

    if (data && data.url) {
      console.log('✅ Google OAuth está configurado!');
      console.log(`   URL de autenticação: ${data.url.substring(0, 50)}...`);
      console.log('\n🎉 Configuração está funcionando corretamente!');
      
      return true;
    } else {
      console.log('⚠️  Resposta inesperada do Supabase');
      console.log('   Data:', data);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erro na conexão:');
    console.log(`   ${error.message}`);
    
    console.log('\n🔧 Verifique:');
    console.log('   1. URL do Supabase está correta');
    console.log('   2. Chave anônima está correta');
    console.log('   3. Projeto Supabase está ativo');
    
    return false;
  }
}

function extractProjectId(supabaseUrl) {
  try {
    return supabaseUrl.split('//')[1].split('.')[0];
  } catch {
    return 'seu-projeto-id';
  }
}

function showConfigInstructions() {
  console.log('\n📋 INSTRUÇÕES DE CONFIGURAÇÃO:');
  console.log('');
  console.log('1. Google Cloud Console:');
  console.log('   - Acesse: https://console.cloud.google.com/');
  console.log('   - Crie credenciais OAuth 2.0');
  console.log('   - Configure redirect URI:');
  console.log(`     ${SUPABASE_URL}/auth/v1/callback`);
  console.log('');
  console.log('2. Supabase Dashboard:');
  console.log(`   - Acesse: https://app.supabase.com/project/${extractProjectId(SUPABASE_URL)}/auth/providers`);
  console.log('   - Ative Google provider');
  console.log('   - Insira Client ID e Secret do Google');
  console.log('');
  console.log('3. Teste novamente:');
  console.log('   - Execute: node test-google-auth.js');
  console.log('   - Ou use o botão "Verificar novamente" na aplicação');
}

// Executar teste
if (require.main === module) {
  console.log('🚀 Teste de Configuração - Google OAuth\n');
  
  if (SUPABASE_URL.includes('seu-projeto-id') || SUPABASE_ANON_KEY.includes('sua-chave')) {
    console.log('⚠️  Configure suas credenciais do Supabase no topo deste arquivo');
    process.exit(1);
  }
  
  testGoogleOAuth()
    .then(success => {
      if (!success) {
        showConfigInstructions();
      }
      console.log('\n🏁 Teste finalizado.');
    })
    .catch(error => {
      console.error('💥 Erro durante o teste:', error);
    });
}

module.exports = { testGoogleOAuth };
