require 'rest-client'

class Docs::Pages::Base < Matestack::Ui::Page

  def prepare
    # Final TODO: change branch to master
    # Final TODO: change line below to call GitHub API like in sidebar (?)
    @github_base_url = "https://#{ENV['GITHUB_USERNAME']}:#{ENV['GITHUB_PERSONAL_ACCESS_TOKEN']}@api.github.com/repos/matestack/matestack-ui-core/contents"
    @branch = 'master'
    case context[:params][:format]
    when 'md'
      @file = context[:params][:key] + '.md'
    when 'rb'
      @file = context[:params][:key] + '.rb'
      @md_language_wrapper = 'ruby'
    else
      @file = context[:params][:key] + '/README.md'
    end
    @github_api_md_path = nil
    @sub_title = nil
  end

  def response
    hero
    content
  end

  def hero
    div class: 'hero'
  end

  def content
    section id: 'content' do
      div class: 'container-fluid' do
        div class: 'row py-4 px-5' do
          div class: 'col-md-12 col-xl-9' do
           docs_md path: @github_api_md_path, remote: true, lang: @md_language_wrapper
          end
          div class: 'col-3 d-none d-xl-flex' do
            async rerender_on: "page_loaded", id: "toc-list" do
              toc
            end
          end
        end
      end
    end
  end

end
