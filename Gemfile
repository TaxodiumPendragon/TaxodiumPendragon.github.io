source "https://rubygems.org"

gem "jekyll", "~> 4.3"
gem "minima", "~> 2.5"
gem "csv"
gem "webrick"
gem "bigdecimal"
gem "base64"
gem "strscan"

# Optional C extension for Liquid; skip if native build fails on CI/Windows
gem "liquid-c", "~> 4.0", platforms: :ruby

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-seo-tag", "~> 2.8"
end

platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1", :platforms => [:windows]

gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
