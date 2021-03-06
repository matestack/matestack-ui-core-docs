require 'rest-client'

class Components::Md < Matestack::Ui::StaticComponent

  def response
    div class: "markdown-content", attributes: { "v-pre": true } do
      plain parsed_markdown.html_safe
    end
  end

  def parsed_markdown
    if @options[:remote] == true
      result = ::Rails.cache.fetch("components_md_remote_#{options[:path]}", expires_in: 5.minutes) do
        Base64.decode64(JSON.parse(RestClient.get(@options[:path]))['content'])
      end
      @md = result
    else
      @md = File.read("#{::Rails.root}/app/#{@options[:path]}.md")
    end

    begin
      if options[:lang].present?
        @md.prepend("```#{options[:lang]} \n")
        @md.concat("\n ```")
      end
    rescue => e
      raise e
    end

    renderer = RougeRender.new(with_toc_data: true)
    parser = Redcarpet::Markdown.new(renderer, fenced_code_blocks: true)
    parser.render(@md.encode('utf-8', invalid: :replace, undef: :replace, replace: '_'))
  end

end
