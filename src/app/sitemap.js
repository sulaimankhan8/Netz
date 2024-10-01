export default function sitemap() {
    return [
      {
        url: 'https://netz-ruby.vercel.app',
        lastModified: new Date(),
        changeFrequency: 'weakly',
        priority: 1,
      },
      {
        url: 'https://netz-ruby.vercel.app/newton-backward',
        lastModified: new Date(),
        changeFrequency: 'weakly',
        priority: 0.8,
      },
      {
        url: 'https://netz-ruby.vercel.app/newton-foward',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
    ]
  }