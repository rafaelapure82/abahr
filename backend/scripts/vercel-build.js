const { execSync } = require('child_process');

console.log('🏁 Starting Vercel Build script...');

try {
  console.log('📦 Running: prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  if (process.env.DATABASE_URL) {
    console.log('🗄️ DATABASE_URL detected. Running migrations and seed...');
    try {
      console.log('🔄 Running: prisma migrate deploy...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      
      console.log('🌱 Running: prisma db seed...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
    } catch (dbError) {
      console.error('⚠️ Database migration/seed failed, but continuing build:', dbError.message);
    }
  } else {
    console.log('⚠️ No DATABASE_URL found. Skipping migrations/seed.');
  }

  console.log('🔨 Compiling TypeScript...');
  execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
